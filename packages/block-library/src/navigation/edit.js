/**
 * WordPress dependencies
 */
import {
	useMemo,
	Fragment,
	useState,
	useEffect,
} from '@wordpress/element';
import {
	InnerBlocks,
	InspectorControls,
	BlockControls,
	__experimentalUseColors,
} from '@wordpress/block-editor';

import apiFetch from '@wordpress/api-fetch';

import { createBlock } from '@wordpress/blocks';
import { withSelect, withDispatch } from '@wordpress/data';
import {
	CheckboxControl,
	PanelBody,
	Spinner,
	Toolbar,
	Placeholder,
	Button,
} from '@wordpress/components';
import { compose } from '@wordpress/compose';

import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import useBlockNavigator from './use-block-navigator';
import BlockNavigationList from './block-navigation-list';
import BlockColorsStyleSelector from './block-colors-selector';

function Navigation( {
	attributes,
	clientId,
	setAttributes,
	hasExistingNavItems,
	updateNavItemBlocks,
} ) {
	//
	// HOOKS
	//
	/* eslint-disable @wordpress/no-unused-vars-before-return */
	const { TextColor } = __experimentalUseColors(
		[ { name: 'textColor', property: 'color' } ],
	);

	const [ pages, setPages ] = useState( null );

	/* eslint-enable @wordpress/no-unused-vars-before-return */
	const { navigatorToolbarButton, navigatorModal } = useBlockNavigator( clientId );

	let isMounted = true;
	let isRequestingPages = false;

	// Builds navigation links from default Pages.
	const defaultPagesNavigationItems = useMemo(
		() => {
			if ( ! pages ) {
				return null;
			}

			return pages.map( ( { title, type, link: url, id } ) => (
				createBlock( 'core/navigation-link',
					{
						type,
						id,
						url,
						label: title.rendered,
						title: title.raw,
						opensInNewTab: false,
					}
				)
			) );
		},
		[ pages ]
	);

	useEffect( () => {
		// Indicate the fetching status
		isRequestingPages = true;

		const baseUrl = '/wp/v2/pages';

		// "view" is required to ensure Pages are returned by REST API
		// for users with lower capabilities such as "Contributor" otherwise
		// Pages are not returned in the request if "edit" context is set
		const context = 'view';

		const filterDefaultPages = {
			parent: 0,
			order: 'asc',
			orderby: 'id',
			context,
		};

		apiFetch( {
			path: addQueryArgs( baseUrl, filterDefaultPages ),
		} ).then(
			( pagesList ) => {
				if ( isMounted ) {
					setPages( pagesList );
				}
				// We've stopped fetching
				isRequestingPages = false;
			}
		).catch(
			() => {
				if ( isMounted ) {
					setPages( [] );
				}
				// We've stopped fetching
				isRequestingPages = false;
			}
		);

		return () => {
			isMounted = false;
		};
	}, [] );

	//
	// HANDLERS
	//

	const handleCreateEmpty = () => {
		const emptyNavLinkBlock = createBlock( 'core/navigation-link' );
		updateNavItemBlocks( [ emptyNavLinkBlock ] );
	};

	const handleCreateFromExistingPages = () => {
		updateNavItemBlocks( defaultPagesNavigationItems );
	};

	const hasPages = pages && pages.length;

	// If we don't have existing items or the User hasn't
	// indicated they want to automatically add top level Pages
	// then show the Placeholder
	if ( ! hasExistingNavItems ) {
		return (
			<Fragment>
				<InspectorControls>
					{ hasPages && (
						<PanelBody
							title={ __( 'Navigation Settings' ) }
						>
							<CheckboxControl
								value={ attributes.automaticallyAdd }
								onChange={ ( automaticallyAdd ) => {
									setAttributes( { automaticallyAdd } );
									handleCreateFromExistingPages();
								} }
								label={ __( 'Automatically add new pages' ) }
								help={ __( 'Automatically add new top level pages to this navigation.' ) }
							/>
						</PanelBody>
					) }
				</InspectorControls>
				<Placeholder
					className="wp-block-navigation-placeholder"
					icon="menu"
					label={ __( 'Navigation' ) }
					instructions={ __( 'Create a Navigation from all existing pages, or create an empty one.' ) }
				>
					<div className="wp-block-navigation-placeholder__buttons">
						<Button
							isDefault
							className="wp-block-navigation-placeholder__button"
							onClick={ handleCreateFromExistingPages }
							disabled={ ! hasPages }
						>
							{ __( 'Create from all top pages' ) }
						</Button>

						<Button
							isLink
							className="wp-block-navigation-placeholder__button"
							onClick={ handleCreateEmpty }
						>
							{ __( 'Create empty' ) }
						</Button>
					</div>
				</Placeholder>
			</Fragment>
		);
	}

	// UI State: rendered Block UI
	return (
		<Fragment>
			<BlockControls>
				<Toolbar>
					{ navigatorToolbarButton }
				</Toolbar>
				<BlockColorsStyleSelector
					value={ TextColor.color }
					onChange={ TextColor.setColor }
				/>
			</BlockControls>
			{ navigatorModal }
			<InspectorControls>
				{ hasPages && (
					<PanelBody
						title={ __( 'Navigation Settings' ) }
					>
						<CheckboxControl
							value={ attributes.automaticallyAdd }
							onChange={ ( automaticallyAdd ) => setAttributes( { automaticallyAdd } ) }
							label={ __( 'Automatically add new pages' ) }
							help={ __( 'Automatically add new top level pages to this navigation.' ) }
						/>
					</PanelBody>
				) }
				<PanelBody
					title={ __( 'Navigation Structure' ) }
				>
					<BlockNavigationList clientId={ clientId } />
				</PanelBody>
			</InspectorControls>
			<TextColor>
				<div className="wp-block-navigation">
					{ ! hasExistingNavItems && isRequestingPages && <><Spinner /> { __( 'Loading Navigation…' ) } </> }

					<InnerBlocks
						allowedBlocks={ [ 'core/navigation-link' ] }
						templateInsertUpdatesSelection={ false }
						__experimentalMoverDirection={ 'horizontal' }
					/>

				</div>
			</TextColor>
		</Fragment>
	);
}

export default compose( [
	withSelect( ( select, { clientId } ) => {
		const innerBlocks = select( 'core/block-editor' ).getBlocks( clientId );

		return {
			hasExistingNavItems: !! innerBlocks.length,
		};
	} ),
	withDispatch( ( dispatch, { clientId } ) => {
		return {
			updateNavItemBlocks( blocks ) {
				dispatch( 'core/block-editor' ).replaceInnerBlocks( clientId, blocks );
			},
		};
	} ),
] )( Navigation );
