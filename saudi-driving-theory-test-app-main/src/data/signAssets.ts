import rawSigns from './ksa_signs.json';

export type SignId = string;

type RawSign = {
  id: string;
  svg: string;
};

const SIGN_ASSETS = (rawSigns as RawSign[]).reduce<Record<SignId, string>>((acc, sign) => {
  acc[sign.id] = sign.svg;
  return acc;
}, {});

const getSignSrc = (signId: SignId): string | undefined => SIGN_ASSETS[signId];

export { SIGN_ASSETS, getSignSrc };
