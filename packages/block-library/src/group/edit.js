/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import {
	InnerBlocks,
	withColors,
} from '@wordpress/block-editor';

import {
	Fragment,
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import Inspector from './inspector';

function GroupEdit( props ) {
	const {
		className,
		backgroundColor,
		hasInnerBlocks,
		attributes,
	} = props;

	const styles = {
		backgroundColor: backgroundColor.color,
	};

	const hasPadding = !! attributes.paddingSize;
	const hasMargin = !! attributes.marginSize;

	const classes = classnames( className, backgroundColor.class, {
		'has-background': !! backgroundColor.color,
		'has-padding': hasPadding,
		'has-margin': hasMargin,
		[ `padding-${ attributes.paddingSize }` ]: hasPadding,
		[ `margin-${ attributes.marginSize }` ]: hasMargin,
	} );

	return (
		<Fragment>
			<Inspector { ...props } />
			<div className={ classes } style={ styles }>
				<div className="wp-block-group__inner-container">
					<InnerBlocks
						renderAppender={ ! hasInnerBlocks && InnerBlocks.ButtonBlockAppender }
					/>
				</div>
			</div>
		</Fragment>
	);
}

export default compose( [
	withColors( 'backgroundColor' ),
	withSelect( ( select, { clientId } ) => {
		const {
			getBlock,
		} = select( 'core/block-editor' );

		const block = getBlock( clientId );

		return {
			hasInnerBlocks: !! ( block && block.innerBlocks.length ),
		};
	} ),
] )( GroupEdit );
