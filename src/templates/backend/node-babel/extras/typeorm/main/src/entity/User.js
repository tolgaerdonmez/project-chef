import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm";

@Entity()
export class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	id = undefined;

	@Column("text")
	name = "";

	@Column("text", { unique: true })
	email = "";

	@Column("text")
	password = "";
}
