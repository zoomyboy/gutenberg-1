/**
 * Processes the given design tokens and outputs a CSS rule.
 *
 * It first creates the merged tree from the input tokens:
 *
 * {
 *     core: {
 *         color: {
 *             text: 'red'
 *         }
 *     },
 *     "core/paragraph": {
 *         color: {
 *             text: 'hotpink'
 *         }
 *     },
 * }
 *
 * which then transforms to a valid CSS rule:
 *
 * :root {
 *     --wp-gs-core-color-text: red;
 *     --wp-gs-core-paragraph-color-text: hotpink;
 * }
 *
 * @param {Object} baseData CSS values set by core and/or the theme.
 * These can't be changed by the user.
 * @param {Object} userData CSS values set by the user.
 *
 * @return {string} The CSS rule containing the proper values.
 */
export default ( baseData = {}, userData = {} ) => {
	const designTokens = {
		...baseData,
		...userData,
	};

	/**
	 * Takes a tree with any levels and flattens it to one.
	 *
	 * @param {Object} tree Tree to flatten.
	 * @param {Object} flattenedTree Accumulator to append properties to.
	 * @param {string} prefix String to prepend to the key being processed.
	 *
	 * @return {Object} The flattened tree.
	 */
	const flattenTree = ( tree, flattenedTree = {}, prefix = '' ) => {
		Object.keys( tree ).forEach( ( key ) => {
			if ( tree[ key ] instanceof Object ) {
				flattenTree( tree[ key ], flattenedTree, prefix + key + '-' );
			} else {
				flattenedTree[ prefix + key ] = tree[ key ];
			}
		} );
		return flattenedTree;
	};

	/**
	 * Takes a flattened tree (only 1 level deep)
	 * and converts each property to a CSS property:
	 *
	 * - key   => CSS property name
	 * - value => CSS property value
	 *
	 * @param {Object} tree Object to transform.
	 * @param {string} prefix String to prepend to every rule.
	 *
	 * @return {string} CSS rule.
	 */
	const toCSSRule = ( tree, prefix = '' ) => {
		let cssRule = '';
		const properties = Object.keys( tree ).map(
			( key ) => `${ prefix + key.replace( '/', '-' ) }: ${ tree[ key ] };`
		);
		if ( properties.length > 0 ) {
			cssRule = ':root {\n' + properties.join( '\n' ) + '\n}';
		}
		return cssRule;
	};

	return toCSSRule( flattenTree( designTokens ), '--wp-gs-' );
};
