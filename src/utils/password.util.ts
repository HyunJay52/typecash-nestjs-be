import * as bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function compareHashedData(
    plainTextData: string,
    hashedData: string,
): Promise<boolean> {
    console.log('**** Comparing data:', plainTextData, hashedData);
    return bcrypt.compare(plainTextData, hashedData);
}
