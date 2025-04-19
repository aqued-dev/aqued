// 簡易 Result

export const ResultType = {
	Success: 1,
	Fail: 0,
} as const;

export type Result<T, E> = { type: typeof ResultType.Success; value: T } | { type: typeof ResultType.Fail; error: E };

export const success = <T>(value: T): Result<T, never> => ({ type: ResultType.Success, value });
export const fail = <E>(error: E): Result<never, E> => ({ type: ResultType.Fail, error });
