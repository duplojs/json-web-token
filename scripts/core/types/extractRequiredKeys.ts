
export type ExtractRequiredKeys<
	GenericObject extends object,
> = {
	[GenericKey in keyof GenericObject]-?:
	{} extends Pick<GenericObject, GenericKey>
		? never
		: GenericKey;
}[keyof GenericObject];
