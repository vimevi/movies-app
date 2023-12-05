export default class MovieService {
	TOKEN = `eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhZTI2M2E0ZDQ3YmYxYmI3NzNhNTNlZmNmYmM3MGRjYyIsInN1YiI6IjY1NWEwNjU5ZWE4NGM3MTA5NTlmOWE1NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.n7Qkzm63Q1_hH7F_eHmn_G8m30_-Vh0j8fAvtmtpX98`;
	API_KEY = `ae263a4d47bf1bb773a53efcfbc70dcc`;
	OPTIONS = {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${this.TOKEN}`,
			'Content-Type': 'application/json',
		},
	};

	async fetchMovieData(value, page) {
		const MOVIE_API_URL = `https://api.themoviedb.org/3/search/movie?query=${value}&page=${page}&language=ru&api_key=ae263a4d47bf1bb773a53efcfbc70dcc`;
		try {
			const response = await fetch(MOVIE_API_URL, this.OPTIONS);
			if (!response.ok) {
				console.error(`Could not fetch ${MOVIE_API_URL}`);
				return null;
			}
			const movieData = await response.json();
			return movieData;
		} catch (error) {
			console.error('Error:', error.message);
			return null;
		}
	}

	async getMovieGenres() {
		const urlGenres =
			'https://api.themoviedb.org/3/genre/movie/list?language=ru';
		try {
			const response = await fetch(urlGenres, this.OPTIONS);
			const data = await response.json();
			const exactList = data.genres;
			const genresData = exactList.reduce((obj, item) => {
				obj[item.id] = item.name;
				return obj;
			}, {});
			return genresData;
		} catch (e) {
			console.log('error', e);
			return null;
		}
	}
	async getRatedMovies(page) {
		const localStorageGuestSessionId = localStorage.getItem('guestSessionId');

		if (!localStorageGuestSessionId) {
			console.error('Guest session ID not found in local storage');
			return null;
		}

		const options = {
			method: 'GET',
			headers: {
				accept: 'application/json',
			},
		};

		try {
			const res = await fetch(
				`https://api.themoviedb.org/3/guest_session/${localStorageGuestSessionId}/rated/movies?api_key=${this.API_KEY}&language=ru-RU&page=${page}`,
				options,
			);

			if (res.ok) {
				const data = await res.json();
				console.log('Rated movies data after fetching:', data);
				return data;
			} else {
				console.error('Error fetching rated movies:', res.statusText);
				return null;
			}
		} catch (error) {
			console.error('Error fetching rated movies:', error);
			return null;
		}
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

		try {
			const response = await fetch(
				`https://api.themoviedb.org/3/movie/${movieId}/rating?api_key=${this.API_KEY}&guest_session_id=${guestSessionId}`,
				options,
			);

			const data = await response.json();

			if (response.ok && data.success) {
				console.log('Оценено:', data);
				return data;
			} else {
				console.error('Error adding rating:', data.status_message);
				return null;
			}
		} catch (error) {
			console.error('Error adding rating:', error);
			return null;
		}
	}

	async requestGuestSessionId() {
		const storedGuestSessionId = localStorage.getItem('guestSessionId');

		if (storedGuestSessionId) {
			return storedGuestSessionId;
		}

		try {
			const options = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${this.TOKEN}`,
				},
			};

			const response = await fetch(
				'https://api.themoviedb.org/3/authentication/guest_session/new',
				options,
			);

			const data = await response.json();

			if (response.ok && data.success) {
				const guestSessionId = data.guest_session_id;
				localStorage.setItem('guestSessionId', guestSessionId);
				return guestSessionId;
			} else {
				console.error('Error:', data.status_message);
				return null;
			}
		} catch (error) {
			console.error('Error fetching guest session ID:', error);
			return null;
		}
	}
}
