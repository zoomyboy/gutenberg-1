/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import edit from './edit';
import metadata from './block.json';
import variations from './variations';

const { name } = metadata;

export { metadata, name };

export const settings = {
	title: __( 'Social Icon' ),
	parent: [ 'core/social-links' ],
	supports: {
		reusable: false,
		html: false,
	},
	edit,
	description: __( 'Create a link to the wider Web' ),
	variations,
};
