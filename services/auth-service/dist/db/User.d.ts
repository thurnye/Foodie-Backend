import mongoose, { Document, Types } from 'mongoose';
export interface IUser extends Document {
    _id: Types.ObjectId;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    bio?: string;
    avatar?: string;
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
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default User;
//# sourceMappingURL=User.d.ts.map