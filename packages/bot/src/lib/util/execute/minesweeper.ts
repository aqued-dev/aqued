export class Minesweeper {
	generate(rows: number, cols: number, mines: number): string {
		const board: (number | '💣')[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
		for (let i = 0; i < mines; i++) {
			let row: number, col: number;
			do {
				row = Math.floor(Math.random() * rows);
				col = Math.floor(Math.random() * cols);
			} while (board[row][col] === '💣');
			board[row][col] = '💣';

			for (let r = -1; r <= 1; r++) {
				for (let c = -1; c <= 1; c++) {
					const nr = row + r,
						nc = col + c;
					if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] !== '💣') {
						board[nr][nc]++;
					}
				}
			}
		}

		const numberToEmoji: { [key: number]: string } = {
			0: '||0⃣||',
			1: '||1⃣||',
			2: '||2⃣||',
			3: '||3⃣||',
			4: '||4⃣||',
			5: '||5⃣||',
			6: '||6⃣||',
			7: '||7⃣||',
			8: '||8⃣||',
			9: '||9⃣||',
		};

		const formattedBoard = board
			.map((row) => row.map((cell) => (cell === '💣' ? '||💣||' : numberToEmoji[cell] || '|| ||')).join(' '))
			.join('\n');

		return formattedBoard;
	}

	beginner() {
		return this.generate(9, 9, 10);
	}
}
