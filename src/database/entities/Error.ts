import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'ERROR' })
export class Error {
	@PrimaryColumn({ name: 'id', type: 'bigint', comment: 'エラーSnowFlake' })
	id: string;
	@Column({ name: 'url', type: 'text', comment: 'エラーのURL' })
	url: string;
	constructor(id: string, url: string) {
		this.id = id;
		this.url = url;
	}
}
