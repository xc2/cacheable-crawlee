export async function reproduction(input: string) {
  const { default: fnv1a } = await import(
    /* webpackChunkName: "_sindresorhus_fnv1a" */ "@sindresorhus/fnv1a"
  );
  console.log(`

      fnv1a hash of "${input}" is "${fnv1a(input, { size: 32 }).toString(16)}"

`);
}
