import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    bio?: string;
    avatar?: string;
    dateOfBirth?: string;
    gender?: string;
    phoneNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    refreshTokens: string[];
    role: 'user' | 'admin' | 'moderator';
    reputation: number;
    createdAt: Date;
    updatedAt: Date;
    slogan: string;
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default User;
//# sourceMappingURL=User.d.ts.map