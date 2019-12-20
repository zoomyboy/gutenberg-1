export const categories = [
	{ slug: 'text', title: 'Text' },
	{ slug: 'media', title: 'Media' },
	{ slug: 'design', title: 'Design' },
	{ slug: 'tools', title: 'Tools' },
	{ slug: 'embed', title: 'Embeds' },
	{ slug: 'reusable', title: 'Reusable blocks' },
];

export const paragraphItem = {
	id: 'core/paragraph-block',
	name: 'core/paragraph-block',
	initialAttributes: {},
	title: 'Paragraph',
	category: 'text',
	isDisabled: false,
	utility: 1,
};

export const advancedParagraphItem = {
	id: 'core/advanced-paragraph-block',
	name: 'core/advanced-paragraph-block',
	initialAttributes: {},
	title: 'Advanced Paragraph',
	category: 'text',
	isDisabled: false,
	utility: 1,
};

export const someOtherItem = {
	id: 'core/some-other-block',
	name: 'core/some-other-block',
	initialAttributes: {},
	title: 'Some Other Block',
	category: 'text',
	isDisabled: false,
	utility: 1,
};

export const moreItem = {
	id: 'core/more-block',
	name: 'core/more-block',
	initialAttributes: {},
	title: 'More',
	category: 'design',
	isDisabled: true,
	utility: 0,
};

export const youtubeItem = {
	id: 'core-embed/youtube',
	name: 'core-embed/youtube',
	initialAttributes: {},
	title: 'YouTube',
	category: 'embed',
	keywords: [ 'google', 'video' ],
	isDisabled: false,
	utility: 0,
};

export const paragraphEmbedItem = {
	id: 'core-embed/a-paragraph-embed',
	name: 'core-embed/a-paragraph-embed',
	initialAttributes: {},
	title: 'A Paragraph Embed',
	category: 'embed',
	isDisabled: false,
	utility: 0,
};

export const reusableItem = {
	id: 'core/block/123',
	name: 'core/block',
	initialAttributes: { ref: 123 },
	title: 'My reusable block',
	category: 'reusable',
	isDisabled: false,
	utility: 0,
};

export default [
	paragraphItem,
	advancedParagraphItem,
	someOtherItem,
	moreItem,
	youtubeItem,
	paragraphEmbedItem,
	reusableItem,
];
