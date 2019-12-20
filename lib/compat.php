<?php
/**
 * Temporary compatibility shims for features present in Gutenberg, pending
 * upstream commit to the WordPress core source repository. Functions here
 * exist only as long as necessary for corresponding WordPress support, and
 * each should be associated with a Trac ticket.
 *
 * @package gutenberg
 */

/**
 * Filters allowed CSS attributes to include `flex-basis`, included in saved
 * markup of the Column block.
 *
 * This can be removed when plugin support requires WordPress 5.3.0+.
 *
 * @see https://core.trac.wordpress.org/ticket/47281
 * @see https://core.trac.wordpress.org/changeset/45363
 *
 * @since 5.7.0
 *
 * @param string[] $attr Array of allowed CSS attributes.
 *
 * @return string[] Filtered array of allowed CSS attributes.
 */
function gutenberg_safe_style_css_column_flex_basis( $attr ) {
	$attr[] = 'flex-basis';

	return $attr;
}
add_filter( 'safe_style_css', 'gutenberg_safe_style_css_column_flex_basis' );

/**
 * Filters default block categories to substitute legacy category names with new
 * block categories.
 *
 * This can be removed when plugin support requires WordPress 5.4.0+.
 *
 * @see Trac Ticket TBD
 *
 * @since 7.3.0
 *
 * @param array[] $default_categories Array of block categories.
 *
 * @return array[] Filtered block categories.
 */
function gutenberg_replace_default_block_categories( $default_categories ) {
	$substitution = array(
		'common'     => array(
			'slug'  => 'text',
			'title' => __( 'Text', 'gutenberg' ),
			'icon'  => null,
		),
		'formatting' => array(
			'slug'  => 'media',
			'title' => __( 'Media', 'gutenberg' ),
			'icon'  => null,
		),
		'layout'     => array(
			'slug'  => 'design',
			'title' => __( 'Design', 'gutenberg' ),
			'icon'  => null,
		),
		'widgets'    => array(
			'slug'  => 'tools',
			'title' => __( 'Tools', 'gutenberg' ),
			'icon'  => null,
		),
	);

	// Loop default categories to perform in-place substitution by legacy slug.
	foreach ( $default_categories as $i => $default_category ) {
		$slug = $default_category['slug'];
		if ( isset( $substitution[ $slug ] ) ) {
			$default_categories[ $i ] = $substitution[ $slug ];
			unset( $substitution[ $slug ] );
		}
	}

	/*
	 * At this point, `$substitution` should contain only the categories which
	 * could not be in-place substituted with a default category, presumably due
	 * to earlier filtering of the default categories. These should be appended.
	 */
	return array_merge( $default_categories, array_values( $substitution ) );
}
add_filter( 'block_categories', 'gutenberg_replace_default_block_categories' );

/**
 * Shim that hooks into `pre_render_block` so as to override `render_block`
 * with a function that passes `render_callback` the block object as the
 * argument.
 *
 * @see https://core.trac.wordpress.org/ticket/48104
 *
 * @param string $pre_render The pre-rendered content. Default null.
 * @param array  $block The block being rendered.
 *
 * @return string String of rendered HTML.
 */
function gutenberg_provide_render_callback_with_block_object( $pre_render, $block ) {
	global $post;

	$source_block = $block;

	/** This filter is documented in src/wp-includes/blocks.php */
	$block = apply_filters( 'render_block_data', $block, $source_block );

	$block_type    = WP_Block_Type_Registry::get_instance()->get_registered( $block['blockName'] );
	$is_dynamic    = $block['blockName'] && null !== $block_type && $block_type->is_dynamic();
	$block_content = '';
	$index         = 0;

	foreach ( $block['innerContent'] as $chunk ) {
		$block_content .= is_string( $chunk ) ? $chunk : render_block( $block['innerBlocks'][ $index++ ] );
	}

	if ( ! is_array( $block['attrs'] ) ) {
		$block['attrs'] = array();
	}

	if ( $is_dynamic ) {
		$global_post = $post;

		$prepared_attributes = $block_type->prepare_attributes_for_render( $block['attrs'] );
		$block_content       = (string) call_user_func( $block_type->render_callback, $prepared_attributes, $block_content, $block );

		$post = $global_post;
	}

	/** This filter is documented in src/wp-includes/blocks.php */
	return apply_filters( 'render_block', $block_content, $block );
}
add_filter( 'pre_render_block', 'gutenberg_provide_render_callback_with_block_object', 10, 2 );

/**
 * Sets the current post for usage in template blocks.
 *
 * @return WP_Post|null The post if any, or null otherwise.
 */
function gutenberg_get_post_from_context() {
	// TODO: Without this temporary fix, an infinite loop can occur where
	// posts with post content blocks render themselves recursively.
	if ( is_admin() || defined( 'REST_REQUEST' ) ) {
		return null;
	}
	if ( ! in_the_loop() ) {
		rewind_posts();
		the_post();
	}
	return get_post();
}
