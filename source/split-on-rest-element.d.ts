import type {IfNotAnyOrNever, IsExactOptionalPropertyTypesEnabled} from './internal/type.d.ts';
import type {ApplyDefaultOptions} from './internal/object.d.ts';
import type {IsOptionalKeyOf} from './is-optional-key-of.d.ts';
import type {IsArrayReadonly} from './internal/array.d.ts';
import type {UnknownArray} from './unknown-array.d.ts';
import type {TupleOf} from './tuple-of.d.ts';
import type {If} from './if.d.ts';

/**
{@link SplitOnRestElement} options.
*/
type SplitOnRestElementOptions = {
	/**
	Whether to preserve the optional modifier (`?`).

	- When set to `true`, the optional modifiers are preserved as-is. For example:
		`SplitOnRestElement<[number, string?, ...boolean[]], {preserveOptionalModifier: true}>` returns `[[number, string?], boolean[], []]`.

	- When set to `false`, optional elements like `T?` are transformed to `T | undefined` or simply `T` depending on the `exactOptionalPropertyTypes` compiler option. For example:
		- With `exactOptionalPropertyTypes` enabled: `SplitOnRestElement<[number, string?, ...boolean[]], {preserveOptionalModifier: false}>` returns `[[number, string], boolean[], []]`
		- And, with it disabled, the result is: `[[number, string | undefined], boolean[], []]`

	@default true
	*/
	preserveOptionalModifier?: boolean;
};

type DefaultSplitOnRestElementOptions = {
	preserveOptionalModifier: true;
};

/**
Splits an array into three parts, where the first contains all elements before the rest element, the second is the [`rest`](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types) element itself, and the third contains all elements after the rest element.

Note: If any of the parts are missing, then they will be represented as empty arrays. For example, `SplitOnRestElement<[string, number]>` returns `[[string, number], [], []]`, where parts corresponding to the rest element and elements after it are empty.

By default, the optional modifier (`?`) is preserved.
See {@link SplitOnRestElementOptions `SplitOnRestElementOptions`}.

@example
```ts
import type {SplitOnRestElement} from 'type-fest';

type T1 = SplitOnRestElement<[number, ...string[], boolean]>;
//=> [[number], string[], [boolean]]

type T2 = SplitOnRestElement<readonly [...boolean[], string]>;
//=> readonly [[], boolean[], [string]]

type T3 = SplitOnRestElement<[number, string?]>;
//=> [[number, string?], [], []]

type T4 = SplitOnRestElement<[number, string?], {preserveOptionalModifier: false}>;
//=> [[number, string], [], []]

type T5 = SplitOnRestElement<readonly [string?, ...number[]], {preserveOptionalModifier: false}>;
//=> readonly [[string], number[], []]
```

@see {@link ExtractRestElement}
@see {@link ExcludeRestElement}
@category Array
*/
export type SplitOnRestElement<
	Array_ extends UnknownArray,
	Options extends SplitOnRestElementOptions = {},
> =
	Array_ extends unknown // For distributing `Array_`
		? IfNotAnyOrNever<Array_, {
			ifNot: _SplitOnRestElement<
				Array_,
				ApplyDefaultOptions<SplitOnRestElementOptions, DefaultSplitOnRestElementOptions, Options>
			>;
		}> extends infer Result extends UnknownArray
			? If<IsArrayReadonly<Array_>, Readonly<Result>, Result>
			: never // Should never happen
		: never; // Should never happen

type Required1000UnknownElements = TupleOf<1000>
type Required100UnknownElements = TupleOf<100>
type Required10UnknownElements = TupleOf<10>

type Optional1000UnknownElements = Partial<Required1000UnknownElements>;
type Optional100UnknownElements = Partial<Required100UnknownElements>;
type Optional10UnknownElements = Partial<Required10UnknownElements>;

// because ts doesnt support doing infer from multiple rest elements a double inference is needed to extract the first N elements and the rest
type GetAllRequiredElementsOnLeftSide<Array_ extends UnknownArray, Accumulator extends UnknownArray = []> =
	// Get the first 1000 required elements
    Array_ extends {[999]: unknown}
        ? Array_ extends readonly [...infer ThousandRequiredElements extends Required1000UnknownElements, ...any] // pull out the elements using the constraint of a fixed tuple
            ? Array_ extends readonly [...Required1000UnknownElements, ...infer RestElements]
                ? GetAllRequiredElementsOnLeftSide<RestElements, [...Accumulator, ...ThousandRequiredElements]>
                : never // should not here because case above would fail
            : never // should not here because case above would fail
    
    // Get the first 100
    : Array_ extends {[99]: unknown}
        ? Array_ extends readonly [...infer HundredRequiredElements extends Required100UnknownElements, ...any] // pull out the elements using the constraint of a fixed tuple
            ? Array_ extends readonly [...Required100UnknownElements, ...infer RestElements]
                ? GetAllRequiredElementsOnLeftSide<RestElements, [...Accumulator, ...HundredRequiredElements]>
                : never // should not here because case above would fail
            : never // should not here because case above would fail
    
    // get the first 10
    : Array_ extends {[9]: unknown}
        ? Array_ extends readonly [...infer TenRequiredElements extends Required10UnknownElements, ...any] // pull out the elements using the constraint of a fixed tuple
            ? Array_ extends readonly [...Required10UnknownElements, ...infer RestElements]
                ? GetAllRequiredElementsOnLeftSide<RestElements, [...Accumulator, ...TenRequiredElements]>
                : never // should not here because case above would fail
            : never // should not here because case above would fail
    
    // just get the first element
    : Array_ extends readonly [infer RequiredElement, ...infer RestElements]
    ? GetAllRequiredElementsOnLeftSide<RestElements, [...Accumulator, RequiredElement]>
    : [Accumulator, Array_]
	
// because ts doesnt support doing infer from multiple rest elements a double inference is needed to extract the first N elements and the rest.
type GetAllOptionalElementsOnLeftSide<Array_ extends UnknownArray, Accumulator extends UnknownArray = []> =
    // ge the first 1000 items
    Array_ extends {[999]?: unknown}
        ? Array_ extends readonly [...infer ThousandOptionalElements extends Optional1000UnknownElements, ...any]
            ? Array_ extends readonly [...Optional1000UnknownElements, ...infer RestElements]
                ? GetAllOptionalElementsOnLeftSide<RestElements, [...Accumulator, ...ThousandOptionalElements]>
                : never
            : never

    // get the first 100 items
    : Array_ extends {[99]?: unknown}
        ? Array_ extends readonly [...infer HundredOptionalElements extends Optional100UnknownElements, ...any]
            ? Array_ extends readonly [...Optional100UnknownElements, ...infer RestElements]
                ? GetAllOptionalElementsOnLeftSide<RestElements, [...Accumulator, ...HundredOptionalElements]>
                : never
            : never
			
    // get the first 10 items
    : Array_ extends {[9]?: unknown}
        ? Array_ extends readonly [...infer TenOptionalElements extends Optional10UnknownElements, ...any]
            ? Array_ extends readonly [...Optional10UnknownElements, ...infer RestElements]
                ? GetAllOptionalElementsOnLeftSide<RestElements, [...Accumulator, ...TenOptionalElements]>
                : never
            : never
    // get the first item
	: Array_ extends {[0]?: unknown}
		? Array_ extends readonly [(infer Head)?, ...infer RestElements]
			? GetAllOptionalElementsOnLeftSide<RestElements, [...Accumulator, ...[Head?]]>
			: never
	: [Accumulator, Array_];

type GetAllElementsOnLeftSide<Array_ extends UnknownArray> =
	GetAllRequiredElementsOnLeftSide<Array_> extends [infer RequiredElements extends UnknownArray, infer OptionalElementsAndRest extends UnknownArray]
	? GetAllOptionalElementsOnLeftSide<OptionalElementsAndRest> extends [infer OptionalElements extends UnknownArray, infer RestAtStart extends UnknownArray]
		? [RequiredElements, OptionalElements, RestAtStart]
		: never
	: never

type GetAllRequiredElementsOnRightSide<Array_ extends UnknownArray, Accumulator extends UnknownArray = []> = 
	Array_ extends readonly [...any, ...infer ThousandRequiredElements extends Required1000UnknownElements]
	? Array_ extends readonly [...infer RestElements, ...Required1000UnknownElements]
		? GetAllRequiredElementsOnRightSide<RestElements, [...ThousandRequiredElements, ...Accumulator]>
		: never
	: Array_ extends readonly [...any, ...infer HundredRequiredElements extends Required100UnknownElements]
		? Array_ extends readonly [...infer RestElements, ...Required100UnknownElements]
			? GetAllRequiredElementsOnRightSide<RestElements, [...HundredRequiredElements, ...Accumulator]>
			: never
	: Array_ extends readonly [...any, ...infer TenRequiredElements extends Required10UnknownElements]
		? Array_ extends readonly [...infer RestElements, ...Required10UnknownElements]
			? GetAllRequiredElementsOnRightSide<RestElements, [...TenRequiredElements, ...Accumulator]>
			: never
	: Array_ extends readonly [...infer RestElements, infer Last]
		? GetAllRequiredElementsOnRightSide<RestElements, [Last, ...Accumulator]>
	: [Accumulator, Array_]

type TransformOptionalElementsByOptions<
	OptionalElements extends UnknownArray, 
	Options extends Required<SplitOnRestElementOptions>
> = 
	Options["preserveOptionalModifier"] extends true
	? OptionalElements
	: IsExactOptionalPropertyTypesEnabled extends true
		? Required<OptionalElements>
		: {[Key in keyof OptionalElements]-?: OptionalElements[Key] | undefined}

export type _SplitOnRestElement<
	Array_ extends UnknownArray,
	Options extends Required<SplitOnRestElementOptions>,
> = 
	number extends Array_["length"]
		? GetAllRequiredElementsOnRightSide<Array_> extends [infer LastElements extends UnknownArray, infer FrontElementsAndRest extends UnknownArray]
			? LastElements extends []
				? GetAllElementsOnLeftSide<FrontElementsAndRest> extends [
					infer RequiredElements extends UnknownArray, 
					infer OptionalElements extends UnknownArray, 
					infer RestElement extends UnknownArray // is now a true array
				]
					? [
						[...RequiredElements, ...TransformOptionalElementsByOptions<OptionalElements, Options>]
						,RestElement, LastElements
					] extends infer Value extends [UnknownArray, UnknownArray, UnknownArray]
						? If<IsArrayReadonly<Array_>, Readonly<Value>, Value>
						: never
					: never
			: GetAllRequiredElementsOnLeftSide<FrontElementsAndRest> extends [infer FrontRequiredElements extends UnknownArray, infer RestElement extends UnknownArray]
				? [FrontRequiredElements, RestElement, LastElements] extends infer Value extends [UnknownArray, UnknownArray, UnknownArray]
					? If<IsArrayReadonly<Array_>, Readonly<Value>, Value>
					: never
				: never
			: never
		: GetAllElementsOnLeftSide<Array_> extends [
			infer RequiredElements extends UnknownArray, 
			infer OptionalElements extends UnknownArray, 
			infer RestElement extends UnknownArray // is really just []
		]
			? [
				[...RequiredElements, ...TransformOptionalElementsByOptions<OptionalElements, Options>]
				,RestElement, []
			] extends infer Value extends [UnknownArray, UnknownArray, UnknownArray]
				? If<IsArrayReadonly<Array_>, Readonly<Value>, Value>
				: never
			: never

export {};
