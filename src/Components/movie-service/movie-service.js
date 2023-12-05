export default class MovieService {
	TOKEN = `eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhZTI2M2E0ZDQ3YmYxYmI3NzNhNTNlZmNmYmM3MGRjYyIsInN1YiI6IjY1NWEwNjU5ZWE4NGM3MTA5NTlmOWE1NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.n7Qkzm63Q1_hH7F_eHmn_G8m30_-Vh0j8fAvtmtpX98`;
	API_KEY = `ae263a4d47bf1bb773a53efcfbc70dcc`;
	BASE_URL = 'https://api.themoviedb.org/3';
	OPTIONS = {
		headers: {
			Authorization: `Bearer ${this.TOKEN}`,
			'Content-Type': 'application/json',
		},
	};

	async fetchMovieData(value, page) {
		const MOVIE_API_URL = `${this.BASE_URL}/search/movie?query=${value}&page=${page}&language=ru&api_key=${this.API_KEY}`;
		return this.fetchData(MOVIE_API_URL);
	}

	async getMovieGenres() {
		const urlGenres = `${this.BASE_URL}/genre/movie/list?language=ru`;
		const data = await this.fetchData(urlGenres);
		return data ? this.extractGenres(data.genres) : null;
	}

	async getRatedMovies(page) {
		const guestSessionId = localStorage.getItem('guestSessionId');

		if (!guestSessionId) {
			console.error('Guest session ID not found in local storage');
			return null;
		}

		const url = `${this.BASE_URL}/guest_session/${guestSessionId}/rated/movies?api_key=${this.API_KEY}&language=ru-RU&page=${page}`;
		return this.fetchData(url, { headers: { accept: 'application/json' } });
	}

	async onAddRating(movieId, ratingValue, guestSessionId) {
		if (!guestSessionId) {
			console.error('Guest session ID is not available');
			return null;
		}

		const options = {
			method: 'POST',
			headers: {
				accept: 'application/json',
				'Content-Type': 'application/json;charset=utf-8',
			},
			body: JSON.stringify({ value: ratingValue }),
		};

		const url = `${this.BASE_URL}/movie/${movieId}/rating?api_key=${this.API_KEY}&guest_session_id=${guestSessionId}`;
		return this.fetchData(url, options);
	}

	async requestGuestSessionId() {
		const storedGuestSessionId = localStorage.getItem('guestSessionId');

		if (storedGuestSessionId) {
			return storedGuestSessionId;
		}

		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${this.TOKEN}`,
			},
		};

		const url = `${this.BASE_URL}/authentication/guest_session/new`;
		const data = await this.fetchData(url, options);

		if (data && data.success) {
			const guestSessionId = data.guest_session_id;
			localStorage.setItem('guestSessionId', guestSessionId);
			return guestSessionId;
		} else {
			console.error('Error:', data ? data.status_message : 'Unknown error');
			return null;
		}
	}

	async fetchData(url, options = {}) {
		try {
			const response = await fetch(url, { ...this.OPTIONS, ...options });

			if (!response.ok) {
				console.error(`Could not fetch ${url}`);
				return null;
			}

			return await response.json();
		} catch (error) {
			console.error('Error:', error.message);
			return null;
		}
	}

	extractGenres(genres) {
		return genres.reduce((obj, item) => {
			obj[item.id] = item.name;
			return obj;
		}, {});
	}
}
