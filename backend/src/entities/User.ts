import { hash } from "argon2";
import { IsEmail, IsStrongPassword, Length } from "class-validator";
import { Field, InputType, ObjectType } from "type-graphql";
import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import Activity from "./Activity";
import PersonalVehicle from "./PersonalVehicle";
import Post from "./Post";
import Like from "./Like";
import Donation from "./Donation";
import Report from "./Report";

export enum UserRole {
  Admin = "admin",
  User = "user",
}

@Entity()
@ObjectType()
class User extends BaseEntity {
  password: string;

  @BeforeInsert()
  async hashPassword() {
    this.hashedPassword = await hash(this.password);
  }

  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field()
  @Column({ unique: true })
  nickname: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  lastName?: string;

  @Column()
  hashedPassword: string;

  @Column({
    default:
      "https://icons.veryicon.com/png/o/miscellaneous/standard/avatar-15.png",
  })
  @Field({ nullable: true })
  avatarUrl: string;

  @Field()
  @Column({ enum: UserRole, default: UserRole.User })
  role: UserRole;

  @Column({ nullable: true, type: "varchar", unique: true })
  emailConfirmationToken?: string | null;

  @Column({ nullable: true, type: "varchar", unique: true })
  resetPasswordToken?: string | null;

  @Column({ default: false })
  emailVerified: boolean;

  @CreateDateColumn()
  @Field()
  createdAt: string;

  @OneToMany(() => Activity, (activity) => activity.user)
  @Field(() => [Activity], { nullable: true })
  activities?: Activity[];

  @ManyToMany(() => User, (user) => user.following)
  @JoinTable({
    name: "follow",
    joinColumn: {
      name: "follower_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "followed_id",
      referencedColumnName: "id",
    },
  })
  @Field(() => [User], { nullable: true })
  followers?: User[];

  @ManyToMany(() => User, (user) => user.followers)
  @Field(() => [User], { nullable: true })
  following?: User[];

  @OneToMany(() => PersonalVehicle, (personalVehicle) => personalVehicle.user)
  @Field(() => [PersonalVehicle], { nullable: true })
  personalVehicles?: PersonalVehicle[];

  @OneToMany(() => Post, (post) => post.user)
  @Field(() => [Post], { nullable: true })
  posts?: Post[];

  @OneToMany(() => Like, (like) => like.user)
  @Field(() => [Like])
  likes: Like[];

  @OneToMany(() => Report, (report) => report.user)
  @Field(() => [Report])
  reports: Report[];

  @Field()
  @Column({ default: false })
  isBlocked: boolean;

  @Field(() => Date, { nullable: true })
  @Column({ type: "timestamp", nullable: true })
  blocked_at: Date | null;

  @Field()
  @Column({ default: false })
  isOnline: boolean;

  @OneToMany(() => Donation, (post) => post.user)
  @Field(() => [Donation], { nullable: true })
  donation?: Donation[];
}

@InputType()
export class NewUserInput {
  @IsEmail()
  @Field()
  email: string;

  @Length(2, 30)
  @Field()
  nickname: string;

  @Field()
  @IsStrongPassword()
  password: string;
}

@InputType()
export class LoginInput {
  @Field()
  emailOrNickname: string;

  @Field()
  @IsStrongPassword()
  password: string;
}

@InputType()
export class ResetPasswordRequestInput {
  @Field()
  email: string;
}

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsStrongPassword()
  password: string;
}

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Length(2, 30)
  @Field({ nullable: true })
  nickname?: string;

  @Length(2, 30)
  @Field({ nullable: true })
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  avatarUrl?: string;
}

export default User;
