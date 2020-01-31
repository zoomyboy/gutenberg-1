/**
 * WordPress dependencies
 */
import { subscribe, select } from '@wordpress/data';
// eslint-disable-next-line import/no-extraneous-dependencies
import domReady from '@wordpress/dom-ready';

/**
 * Internal dependencies
 */
import resolver from './resolver';

/**
 * DOM updater
 *
 */
export default () => {
	domReady( () => {
		function maybeCreateGlobalStylesNode() {
			let node = document.getElementById( 'wp-global-styles' );
			if ( ! node ) {
				node = document.createElement( 'style' );
				node.setAttribute( 'id', 'wp-global-styles' );
				document.getElementsByTagName( 'head' )[ 0 ].appendChild( node );
			}
			return node;
		}
		const node = maybeCreateGlobalStylesNode();

		const maybeTriggerRetrievalFromREST = ( globalStylesId ) => {
			if ( globalStylesId ) {
				// Trigger entity retrieval from REST API.
				select( 'core' ).getEntityRecord( 'postType', 'wp_global_styles', globalStylesId );
			}
		};
		let globalStylesId = select( 'core/block-editor' ).__experimentalGetGlobalStylesId();
		maybeTriggerRetrievalFromREST( globalStylesId );

		let originalDesignTokens = {};
		subscribe( () => {
			if ( globalStylesId === null ) {
				// Note that we pressume the globalStylesId remains unchanged
				// once we get a number: unless there are two users
				// in parallel doing changes this is fair assumption.
				globalStylesId = select( 'core/block-editor' ).__experimentalGetGlobalStylesId();
				maybeTriggerRetrievalFromREST( globalStylesId );
				return;
			}

			// Can't use hasEditsForEntityRecord,
			// so we resort to do it ourselves.
			const edits = select( 'core' ).getEntityRecordEdits(
				'postType',
				'wp_global_styles',
				globalStylesId
			);
			// FIX THIS: note that this will be true always
			// after the first time a record is edited.
			//
			// We either want to listen to the edit
			// actions directly or deeply compare the edit objects.
			if ( edits && Object.keys( edits ).length > 0 ) {
				node.textContent = resolver(
					select( 'core/block-editor' ).__experimentalGetGlobalStylesBaseTokens(),
					{
						...originalDesignTokens,
						...edits,
					}
				);
			} else if ( Object.keys( originalDesignTokens ).length === 0 ) {
				const record = select( 'core' ).getRawEntityRecord(
					'postType',
					'wp_global_styles',
					globalStylesId
				);
				if ( record ) {
					originalDesignTokens = JSON.parse( record.content );
				}
			}
		} );
	} );
};
