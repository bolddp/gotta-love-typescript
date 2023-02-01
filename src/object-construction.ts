const number01 = 12;
const number02 = 13;

const arrayOfNumbers = [number01, number02];

interface ComplexArrayObject {
  aRequiredNumber: number;
  anOptionalString?: string;
}

const aComplexArrayObject: ComplexArrayObject = {
  aRequiredNumber: 13,
};

const complexArray: ComplexArrayObject[] = [
  aComplexArrayObject,
  { aRequiredNumber: 14, anOptionalString: "yes indeed" },
];
