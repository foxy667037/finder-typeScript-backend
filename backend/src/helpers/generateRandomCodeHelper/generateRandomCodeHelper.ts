const generateRandomCodeHelper = async (): Promise<number> => {
    const code = Math.floor(100000 + Math.random() * 900000);
    return code;
};

export default generateRandomCodeHelper;