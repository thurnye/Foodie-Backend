import mongoose, { Document } from 'mongoose';
export interface ITeam extends Document {
    name: string;
    description?: string;
    avatar?: string;
    members: mongoose.Types.ObjectId[];
    channels: mongoose.Types.ObjectId[];
    owner: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ITeam, {}, {}, {}, mongoose.Document<unknown, {}, ITeam, {}, {}> & ITeam & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Team.d.ts.map