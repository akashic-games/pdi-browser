// NOTE: ユニットテストで参照される最低限のメソッドのみをモック
Object.defineProperty(window, "AudioContext", {
	writable: true,
	value: jest.fn().mockImplementation(() => ({
		createGainNode: jest.fn().mockImplementation(() => ({
			connect: jest.fn()
		}))
	}))
});
