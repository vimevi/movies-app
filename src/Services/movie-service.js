class movieService {
	TOKEN = `eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhZTI2M2E0ZDQ3YmYxYmI3NzNhNTNlZmNmYmM3MGRjYyIsInN1YiI6IjY1NWEwNjU5ZWE4NGM3MTA5NTlmOWE1NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.n7Qkzm63Q1_hH7F_eHmn_G8m30_-Vh0j8fAvtmtpX98`;
	API_KEY = `ae263a4d47bf1bb773a53efcfbc70dcc`;
	BASE_URL = 'https://api.themoviedb.org/3';
	OPTIONS = {
		headers: {
			Authorization: `Bearer ${this.TOKEN}`,
			'Content-Type': 'application/json',
		},
	};

	async getMovieGenres() {
		const url = new URL(`${this.BASE_URL}/genre/movie/list`);
		url.searchParams.set('language', 'ru');
		const data = await this.fetchData(url);
		return data ? this.extractGenres(data.genres) : null;
	}

	async getRatedMovies(page = 1) {
		const localStorageGuestSessionId = localStorage.getItem('guestSessionId');

		const url = new URL(
			`https://api.themoviedb.org/3/guest_session/${localStorageGuestSessionId}/rated/movies`,
		);

		url.searchParams.set('api_key', this.API_KEY);
		url.searchParams.set('language', 'ru-RU');
		url.searchParams.set('page', page);

		const options = {
			method: 'GET',
			headers: {
				accept: 'application/json',
			},
		};
		const response = await fetch(url.toString(), options);

		const data = await response.json();
		return data;
	}

	async fetchMovieData(value, page) {
		try {
			const url = new URL(`${this.BASE_URL}/search/movie`);
			url.searchParams.set('query', value);
			url.searchParams.set('page', page);
			url.searchParams.set('language', 'ru');
			url.searchParams.set('api_key', this.API_KEY);
			return this.fetchData(url);
		} catch (e) {
			console.error('error has beed detected', e);
		}
	}
	async onAddRating(movieId, ratingValue, guestSessionId) {
		const options = {
			method: 'POST',
			headers: {
				accept: 'application/json',
				'Content-Type': 'application/json;charset=utf-8',
			},
			body: JSON.stringify({ value: ratingValue }),
		};
		const url = new URL(`${this.BASE_URL}/movie/${movieId}/rating`);
		url.searchParams.set('api_key', this.API_KEY);
		url.searchParams.set('guest_session_id', guestSessionId);

		return this.fetchData(url, options);
	}

	async requestGuestSessionId() {
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.TOKEN}`,
			},
		};
		const url = new URL(`${this.BASE_URL}/authentication/guest_session/new`);
		const data = await this.fetchData(url, options);

		const guestSessionId = data.guest_session_id;
		localStorage.setItem('guestSessionId', guestSessionId);
		return guestSessionId;
	}

	async fetchData(url, options = {}) {
		const response = await fetch(url, { ...this.OPTIONS, ...options });
		return await response.json();
	}

	extractGenres(genres) {
		return genres.reduce((obj, item) => {
			obj[item.id] = item.name;
			return obj;
		}, {});
	}
}

export default new movieService();
