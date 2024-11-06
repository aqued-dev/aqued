import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'ERROR' })
export class Error {
	@PrimaryColumn({ name: 'id', type: 'bigint', comment: 'エラーSnowFlake' })
	id: string;
	@Column({ name: 'text', type: 'text', comment: 'エラー内容' })
	text: string;

	constructor(id: string, text: string) {
		this.id = id;
		this.text = text;
	}
}
