/**
 * WordPress dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { name as buttonBlockName } from '../button/';

const ALLOWED_BLOCKS = [ buttonBlockName ];
const BUTTONS_TEMPLATE = [ [ 'core/button' ] ];

function ButtonsEdit() {
	return (
		<InnerBlocks
			allowedBlocks={ ALLOWED_BLOCKS }
			template={ BUTTONS_TEMPLATE }
			renderAppender={ InnerBlocks.ButtonBlockAppender }
			__experimentalMoverDirection="horizontal"
		/>
	);
}

export default ButtonsEdit;
