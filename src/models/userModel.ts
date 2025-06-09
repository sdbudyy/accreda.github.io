import { Schema, model, Document, Model } from 'mongoose';

interface IUser extends Document {
  email: string;
  full_name: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

interface IUserModel extends Model<IUser> {
  getAllUsers(): Promise<IUser[]>;
}

const userSchema = new Schema<IUser, IUserModel>({
  email: { type: String, required: true, unique: true },
  full_name: { type: String, required: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

userSchema.statics.getAllUsers = async function(): Promise<IUser[]> {
  try {
    const users = await this.find().select('-password');
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const User = model<IUser, IUserModel>('User', userSchema); 