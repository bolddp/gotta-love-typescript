const number01 = 12;
const number02 = 13;
const oopsAString = 'hej';

const arr = [number01, number02, oopsAString];

interface ComplexArrayObject {
  aRequiredNumber: number;
  anOptionalString?: string;
}

const aComplexArrayObject: ComplexArrayObject = {
  aRequiredNumber: 13,
};

const useComplexArrayObject = (obj: ComplexArrayObject) => {
  console.log(JSON.stringify(obj));
};

const complexArray: ComplexArrayObject[] = [
  aComplexArrayObject,
  { aRequiredNumber: 14, anOptionalString: 'yes indeed' },
];
