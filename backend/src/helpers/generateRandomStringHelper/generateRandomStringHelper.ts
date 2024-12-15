function generateRandomString(length: number): string {
  if (length > 35) {
    throw new Error("Length cannot exceed 25 characters.");
  }

  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters[randomIndex];
  }

  return result;
}

const generateRandomStringHelper = generateRandomString(35);

export default generateRandomStringHelper;