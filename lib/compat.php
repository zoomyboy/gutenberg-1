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
 * Registers the user meta property responsible for storing preferences for the
 * data script persistence middleware. The meta is explicitly registered so that
 * it is made accessible for read and write via the REST API.
 */
function gutenberg_register_data_persistence_user_meta() {
	global $wpdb;
	register_meta(
		'user',
		$wpdb->get_blog_prefix() . 'data_persistence',
		array(
			'type'         => 'object',
			'single'       => true,
			'show_in_rest' => array(
				'name'   => 'data_persistence',
				'type'   => 'object',
				'schema' => array(
					'type'                 => 'object',
					'properties'           => array(),
					'additionalProperties' => true,
				),
			),
		)
	);
}
add_action( 'init', 'gutenberg_register_data_persistence_user_meta' );

/**
 * Enqueues inline scripts used to provide a custom storage interface for the
 * data script persistence middleware. The custom storage implementation stores
 * persisted values using user meta, bootstrapped for initial read at load-time,
 * and updated via the REST API on change.
 */
function gutenberg_user_settings_data_persistence_inline_script() {
	global $wp_scripts, $wpdb;

	$user_id = get_current_user_id();
	if ( empty( $user_id ) ) {
		/*
		 * In most cases, it should be expected that this would only be reached
		 * while logged in and viewing the block editor. However, there may be
		 * edge cases where a plugin is calling to enqueue block assets outside
		 * the editor and when a user may not be logged in.
		 */
		return;
	}

	$persisted_value = get_user_meta( $user_id, $wpdb->get_blog_prefix() . 'data_persistence', true );
	if ( empty( $persisted_value ) ) {
		/*
		 * If there's no explicit metadata assigned, fall back to a value which
		 * was persisted using browser storage, prior to user meta persistence.
		 */
		$persisted_value = sprintf( 'localStorage.getItem( "WP_DATA_USER_%s" );', $user_id );
	} else {
		/*
		 * Otherwise, encode the string value for interpolation in the storage
		 * implementation script. The first `json_encode` will is responsible
		 * for producing a JSON encoding of the persisted meta object, and the
		 * second will apply quoting to that string result.
		 */
		$persisted_value = wp_json_encode( wp_json_encode( $persisted_value ) );
	}

	$persistence_script = <<<JS
( function() {
	wp.data.use( wp.data.plugins.persistence, {
		storage: {
			getItem: function() {
				return {$persisted_value};
			},
			setItem: function( key, value ) {
				wp.apiFetch( {
					path: '/wp/v2/users/me',
					method: 'POST',
					data: {
						meta: {
							data_persistence: JSON.parse( value ),
						}
					}
				} );
			}
		}
	} );
} )();
JS;

	$wp_scripts->registered['wp-data']->extra['after'] = array();
	wp_add_inline_script( 'wp-data', $persistence_script );
}
add_action( 'enqueue_block_editor_assets', 'gutenberg_user_settings_data_persistence_inline_script', 20 );

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
