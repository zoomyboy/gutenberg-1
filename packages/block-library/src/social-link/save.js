/**
 * External dependencies
 */
import classNames from 'classnames';

const SocialLinkSave = ( { attributes } ) => {
	const { url, site, label } = attributes;
	const classes = classNames(
		'wp-social-link',
		'wp-social-link-' + site,
		{ 'wp-social-link__is-incomplete': ! url },
	);

	return (
		<li className={ classes }>
			<a href={ url }>
				<em>{ label }</em>
			</a>
		</li>
	);
};

export default SocialLinkSave;
