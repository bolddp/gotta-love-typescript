interface AnObject {
  data?: string;
}

const processObject = (obj: AnObject) => {
  if (!obj.data) {
    // return;
    throw new Error("No data!");
  }
  console.log(`Uppercase data! ${obj.data.toUpperCase()}`);
};
