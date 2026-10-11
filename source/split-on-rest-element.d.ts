import type {IfNotAnyOrNever, IsExactOptionalPropertyTypesEnabled} from './internal/type.d.ts';
import type {ApplyDefaultOptions} from './internal/object.d.ts';
import type {IsOptionalKeyOf} from './is-optional-key-of.d.ts';
import type {IsArrayReadonly, SetArrayAccess} from './internal/array.d.ts';
import type {UnknownArray} from './unknown-array.d.ts';
import type {TupleOf} from './tuple-of.d.ts';
import type {If} from './if.d.ts';
import type {Sum} from "./sum.d.ts"
import type {ArrayTail} from "./array-tail.d.ts"
// import type {Subtract} from './subtract.d.ts'
// import type {Writable} from './writable.d.ts'

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

type ToFillSlotsFromT = Record<`${number}`|number, unknown> & Record<string|symbol, unknown>
type MatcherListT = [TupleOf<1000>, TupleOf<100>, TupleOf<10>, TupleOf<1>]

// fill the slots of the matcher tuple using the values from the object
type FillTupleSlotsWithNumberKeys<Obj extends ToFillSlotsFromT, Tuple extends UnknownArray> = {
    [K in keyof Tuple]: Obj[K]
}

type GetFixedItemsFromLeft<Array_ extends UnknownArray, Matcher extends UnknownArray> =
    // check if the object has that key
    `${Sum<Matcher["length"], -1>}` extends keyof Array_
    ?
        // do inference
        Array_ extends readonly [...Matcher, ...infer Rest extends UnknownArray]
        ? [FillTupleSlotsWithNumberKeys<Pick<Array_, (keyof Matcher & keyof Array_) & `${number}`>, Matcher>, Rest]
        // the inference failed due to an optional item
        : [[], Array_]
    // the Array_ doesnt contain enough items
    : [[], Array_]

type GetItemsFromLeft<Array_ extends UnknownArray, MatcherList extends readonly UnknownArray[], _Acc extends UnknownArray = []> =
    MatcherList extends readonly []
        // All the matchers are removed, meaning that the left side is devoid of fixed items that can be matched by the matchers
        ? [_Acc, Array_]
        : 
            // Perform the left side extraction
            GetFixedItemsFromLeft<Array_, MatcherList[0]> extends [
                infer FixedItems extends UnknownArray,
                infer RestArray extends UnknownArray,
            ]
                ?
                    // Check if FixedItems is empty, which means the inference failed
                    FixedItems extends readonly []
                        // Remove the first (largest) matcher from the matcher list and keep the accumulator the same
                        ? GetItemsFromLeft<RestArray, ArrayTail<MatcherList>, _Acc>
                        // Keep the first (largest) matcher from the matcher list and append the fixed items to the accumulator
                        : GetItemsFromLeft<RestArray, MatcherList, [..._Acc, ...FixedItems]>
                // Should not reach here as the inference should always pass
                : never



type GetAllItemsFromLeft<Array_ extends UnknownArray, MatcherList extends readonly UnknownArray[]> = 
    // Extract the required elements first
    GetItemsFromLeft<Array_, MatcherList> extends [infer Accumulated extends UnknownArray, infer RestArray extends UnknownArray]
    // Extract the optional elements by making them Required and then making them Optional
    ? GetItemsFromLeft<Required<RestArray>, MatcherList> extends [infer OptionalAccumulated extends UnknownArray, infer FinalRestArray extends UnknownArray]
        // Return the Required, the Optional and the Rest
        ? [[Accumulated, Partial<OptionalAccumulated>], FinalRestArray]
        // Should not reach here as the inference should always pass
        : never
    // Should not reach here as the inference should always pass
    : never

// extract the rest from the left side preceding the matcher
type GetRestFromRightSideWithMatcher<Array_ extends UnknownArray, Matcher extends UnknownArray> =
    Array_ extends readonly [...infer Rest, ...Matcher]
    ? Rest
    : never

// For some reason Extraction of chunk of tuples leads it just getting explicitly casted to the constraint
// therefore this part is done manually
type ExtractRightSide<Array_ extends UnknownArray, _Acc extends UnknownArray = []> =
	// Extract 1000s
    Array_ extends readonly [...any, ...infer Chunk extends MatcherListT[0]]
    ? ExtractRightSide<GetRestFromRightSideWithMatcher<Array_, MatcherListT[0]>, [...Chunk, ..._Acc]>
	// Extract 100s
    : Array_ extends readonly [...any, ...infer Chunk extends MatcherListT[1]]
    ? ExtractRightSide<GetRestFromRightSideWithMatcher<Array_, MatcherListT[1]>, [...Chunk, ..._Acc]>
	// Extract 10s
    : Array_ extends readonly [...any, ...infer Chunk extends MatcherListT[2]]
    ? ExtractRightSide<GetRestFromRightSideWithMatcher<Array_, MatcherListT[2]>, [...Chunk, ..._Acc]>
	// Extract 1s
    : Array_ extends readonly [...any, ...infer Chunk extends MatcherListT[3]]
    ? ExtractRightSide<GetRestFromRightSideWithMatcher<Array_, MatcherListT[3]>, [...Chunk, ..._Acc]>
    : [_Acc, Array_]

type ApplyOptionsOnOptionalElements<OptionalElements extends UnknownArray, Options extends Required<SplitOnRestElementOptions>> =
	Options["preserveOptionalModifier"] extends true
	? OptionalElements
	: Required<
		IsExactOptionalPropertyTypesEnabled extends true
			? OptionalElements
			: {
				[K in keyof OptionalElements]: OptionalElements[K] | undefined
			}
	>

/**
Deconstructs an array on its rest element and returns the split portions.
*/
export type _SplitOnRestElement<Array_ extends UnknownArray, Options extends Required<SplitOnRestElementOptions>> = 
	number extends Array_["length"]
	? 
		GetAllItemsFromLeft<Array_, MatcherListT> extends [[infer RequiredElements extends UnknownArray, infer OptionalElements extends UnknownArray], infer RestAndRightSideElementsArray extends UnknownArray]
			? ExtractRightSide<RestAndRightSideElementsArray> extends [infer RightFixedElements extends UnknownArray, infer RestArray extends UnknownArray]
				? SetArrayAccess<[
					[...RequiredElements, ...ApplyOptionsOnOptionalElements<OptionalElements, Options>], 
					RestArray, 
					RightFixedElements
				], IsArrayReadonly<Array_>>
				// should not reach here
				: never
			// should never happen
			: never
	: GetAllItemsFromLeft<Array_, MatcherListT> extends [[infer RequiredElements extends UnknownArray, infer OptionalElements extends UnknownArray], unknown]
		? SetArrayAccess<[
			[...RequiredElements, ...ApplyOptionsOnOptionalElements<OptionalElements, Options>], 
			[], 
			[]
		], IsArrayReadonly<Array_>>
		// should not reach here
		: never

export {};
