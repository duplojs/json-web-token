import { defineConfig } from "vitepress";
import { transformerTwoslash } from "@shikijs/vitepress-twoslash";
import { ModuleDetectionKind, ModuleKind, ModuleResolutionKind } from "typescript";
import { groupIconMdPlugin, groupIconVitePlugin } from "vitepress-plugin-group-icons";
import { A, innerPipe, S } from "@duplojs/utils";

const hostname = "https://json-web-token.duplojs.dev";
const ogImage = new URL("/images/ogImage.png", hostname).toString();

export default defineConfig({
	title: "@duplojs/json-web-token",
	base: "/",
	cleanUrls: true,
	sitemap: {
		hostname,
	},
	themeConfig: {
		logo: "/images/logo.png",

		socialLinks: [
			{
				icon: "github",
				link: "https://github.com/duplojs/json-web-token",
			},
			{
				icon: "npm",
				link: "https://www.npmjs.com/package/@duplojs/json-web-token",
			},
			{
				icon: "linkedin",
				link: "https://linkedin.com/company/duplojs",
			},
			{
				icon: "discord",
				link: "https://discord.gg/5d6Ze5Wuqm",
			},
		],

		search: {
			provider: "local",
		},
	},
	head: [
		[
			"link",
			{
				rel: "icon",
				href: "/images/logo.ico",
			},
		],
		[
			"meta",
			{
				property: "og:type",
				content: "website",
			},
		],
		[
			"meta",
			{
				property: "og:image",
				content: ogImage,
			},
		],
		[
			"meta",
			{
				name: "twitter:card",
				content: "summary_large_image",
			},
		],
		[
			"meta",
			{
				name: "twitter:image",
				content: ogImage,
			},
		],
	],
	markdown: {
		lineNumbers: false,
		theme: {
			light: "light-plus",
			dark: "dark-plus",
		},
		config: (md) => {
			md.use(groupIconMdPlugin);
		},
		codeTransformers: [
			{
				name: "duplo-version-transformer",
				preprocess: innerPipe(
					S.replace(
						/\/\/ @version: (?<version>[0-9]+)/,
						({ namedGroups }) => A.join(
							[
								"// @filename: @duplojs/json-web-token.ts",
								`export * from "@v${namedGroups?.version ?? ""}";`,

								"// @filename: index.ts",
								"// ---cut---",
							],
							"\n",
						),
					),
					S.replace(
						/ ?@ts-expect-error/g,
						"",
					),
				),
			},
			transformerTwoslash({
				twoslashOptions: {
					compilerOptions: {
						module: ModuleKind.ESNext,
						moduleResolution: ModuleResolutionKind.Bundler,
						moduleDetection: ModuleDetectionKind.Force,
						paths: {
							"@v0": ["libs/v0/index"],
						},
					},
				},
			}),
		],
		languages: ["js", "jsx", "ts", "tsx"],
	},
	vite: {
		plugins: [groupIconVitePlugin()],
	},
	transformPageData(pageData) {
		const frontmatter = pageData.frontmatter ?? {};

		if (frontmatter.layout === "home") {
			return pageData;
		}

		if (typeof frontmatter.pageClass === "string" && frontmatter.pageClass.length > 0) {
			return pageData;
		}

		frontmatter.pageClass = "layout-wide";
		pageData.frontmatter = frontmatter;

		return pageData;
	},
	locales: {
		fr: {
			description: "",
			label: "Français",
			lang: "fr",
			link: "/fr/",
			themeConfig: {
				nav: [
					{
						text: "Guide",
						link: "/fr/v0/guide/",
					},
					{
						text: "API",
						items: [
							{
								text: "Overview",
								link: "/fr/v0/api/",
							},
							{
								text: "TokenHandler",
								link: "/fr/v0/api/tokenHandler/",
							},
							{
								text: "Signer",
								link: "/fr/v0/api/signer/",
							},
							{
								text: "Cipher",
								link: "/fr/v0/api/cipher/",
							},
						],
					},
					{
						text: "v0.x (LTS)",
						items: [
							{
								text: "v0.x (LTS)",
								link: "/fr/v0/guide/",
							},
						],
					},
				],
				sidebar: {
					"/en/v0/guide/": [
						{
							text: "Commencer",
							items: [
								{
									text: "Introduction",
									link: "/fr/v0/guide/",
								},
								{
									text: "Démarrage rapide",
									link: "/fr/v0/guide/quickStart",
								},
							],
						},
					],
				},
				docFooter: {
					prev: "Page précédente",
					next: "Page suivante",
				},
				outline: {
					label: "Sur cette page",
				},
				returnToTopLabel: "Retour en haut",
				darkModeSwitchLabel: "Mode sombre",
				footer: {
					copyright: "Copyright © 2025-présent Contributeurs de DuploJS",
					message: "Diffusé sous licence MIT.",
				},
			},
		},
		root: {
			description: "",
			label: "English",
			lang: "en",
			link: "/en/",
			themeConfig: {
				nav: [
					{
						text: "Guide",
						link: "/en/v0/guide/",
					},
					{
						text: "API",
						items: [
							{
								text: "Overview",
								link: "/en/v0/api/",
							},
							{
								text: "TokenHandler",
								link: "/en/v0/api/tokenHandler/",
							},
							{
								text: "Signer",
								link: "/en/v0/api/signer/",
							},
							{
								text: "Cipher",
								link: "/en/v0/api/cipher/",
							},
						],
					},
					{
						text: "v0.x (LTS)",
						items: [
							{
								text: "v0.x (LTS)",
								link: "/en/v0/guide/",
							},
						],
					},
				],
				sidebar: {
					"/en/v0/guide/": [
						{
							text: "Getting Started",
							items: [
								{
									text: "Introduction",
									link: "/en/v0/guide/",
								},
								{
									text: "Quick Start",
									link: "/en/v0/guide/quickStart",
								},
							],
						},
					],
				},
				docFooter: {
					prev: "Previous page",
					next: "Next page",
				},
				outline: { label: "On this page" },
				returnToTopLabel: "Return to top",
				darkModeSwitchLabel: "Dark mode",
				footer: {
					copyright: "Copyright © 2025-present DuploJS Contributors",
					message: "Released under the MIT license.",
				},
			},
		},
	},
});
