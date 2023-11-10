export function checkAPIError<
  T extends {
    code: number;
    msg: string;
  },
>(res: T) {
  if (res.code !== 0) {
    throw new Error(`Lark API Error ${res.msg}`);
  }

  return res;
}
