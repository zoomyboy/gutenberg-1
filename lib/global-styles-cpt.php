<?php

function gutenberg_global_styles_experimental_register_cpt() {
	$args = [
		'label'        => 'Global Styles', 'gutenberg',
		'description'  => 'CPT to store user design tokens',
		'public'       => false,
		'show_ui'      => false,
		'show_in_rest' => true,
		'rest_base'    => '__experimental/global-styles',
		'capabilities' => [
			'read'                   => 'edit_theme_options',
			'create_posts'           => 'edit_theme_options',
			'edit_posts'             => 'edit_theme_options',
			'edit_published_posts'   => 'edit_theme_options',
			'delete_published_posts' => 'edit_theme_options',
			'edit_others_posts'      => 'edit_theme_options',
			'delete_others_posts'    => 'edit_theme_options',
		],
		'map_meta_cap' => true,
		'supports'     => [
			'editor',
			'revisions',
		]
	];
	register_post_type( 'wp_global_styles', $args );
}
add_action( 'init', 'gutenberg_global_styles_experimental_register_cpt' );

function gutenberg_global_styles_experimental_settings( $settings ) {
	// // Uncomment to create a first CPT
	// // for testing purposes.
	// wp_insert_post( [
	// 	'ID'           => 0,
	// 	'post_content' => json_encode( [
	// 		'core' => [
	// 			'color'=> [
	// 				'text' => 'black',
	// 			],
	// 		],
	// 		'core/paragraph' => [
	// 			'color' => [
	// 				'text' => 'black',
	// 			]
	// 		]
	// 	] ),
	// 	'post_type' => 'wp_global_styles',
	// ] );

	// Add CPT ID
	$recent_posts = wp_get_recent_posts( [
		'numberposts' => 1,
		'orderby'     => 'ID',
		'order'       => 'desc',
		'post_type'   => 'wp_global_styles',
	] );
	if ( is_array( $recent_posts ) && ( count( $recent_posts ) > 0 ) ) {
		$settings['__experimentalGlobalStylesId'] = $recent_posts[ 0 ][ 'ID' ];
	} else {
		$settings['__experimentalGlobalStylesId'] = null;
	}

	// Make base design tokens available.
	// These should come via merging theme.json and core.json
	$settings['__experimentalGlobalStylesBaseTokens'] = [
		'core' => [
			'color'=> [
				'text' => 'black',
			],
		],
		'core/paragraph' => [
			'color' => [
				'text' => 'black',
			],
		],
	];

	return $settings;
}
add_filter( 'block_editor_settings', 'gutenberg_global_styles_experimental_settings' );

/**
 * Adds class wp-gs to the block-editor body class.
 *
 * @param string $classes Existing body classes separated by space.
 * @return string The filtered string of body classes.
 */
function gutenberg_global_styles_experimental_wpadmin_class( $classes ) {
	global $current_screen;
	if ( $current_screen->is_block_editor() ) {
		return $classes . ' wp-gs';
	}
	return $classes;
}
add_filter( 'admin_body_class', 'gutenberg_global_styles_experimental_wpadmin_class' );
