import { Component } from 'react';

import { Pagination, Alert } from 'antd';
import debounce from 'lodash.debounce';

import { Offline, Online } from 'react-detect-offline';
import MovieList from '../movie-list/movie-list';
import SearcItem from '../search-item';
import MovieService from '../movie-service';
import Header from '../header';
import RatedMovieList from '../rated-movie-list';

import './app.scss';

export default class App extends Component {
	state = {
		movieData: null,
		loading: false,
		genresData: null,
		currentPage: 1,
		searchComlited: false,
		value: '',
		rating: null,
		ratedMoviesData: null,
		ratedMoviesCurrentPage: 1,
		guestSessionId: null,
		activeTab: 'search',
	};
	_token =
		'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhZTI2M2E0ZDQ3YmYxYmI3NzNhNTNlZmNmYmM3MGRjYyIsInN1YiI6IjY1NWEwNjU5ZWE4NGM3MTA5NTlmOWE1NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.n7Qkzm63Q1_hH7F_eHmn_G8m30_-Vh0j8fAvtmtpX98';

	onInputChange = (e) => {
		const value = e.target.value;
		this.setState({ value });
		this.debouncedFetchData(value);
	};

	rateMovieAndFetchData = async () => {
		this.fetchMovieData(this.state.value, this.state.currentPage);
	};

	componentDidMount() {
		this.getMovieGenres();
		this.requestGuestSessionId();
		this.getRatedMovies();
	}

	fetchMovieData = async (value, page = 1) => {
		try {
			this.setState({ loading: true });
			const movieData = await MovieService.fetchMovieData(value, page);

			this.setState({
				movieData: movieData,
				loading: false,
				searchComlited: true,
			});
		} catch (error) {
			console.error('Error fetching movie data:', error);
			this.setState({ movieData: null, loading: false });
		}
	};

	// getMovieGenres = async () => {
	// 	const genresData = await MovieService.getMovieGenres();
	// 	if (genresData) {
	// 		this.setState({ genresData });
	// 	}
	// };

	getMovieGenres = async () => {
		try {
			const genresData = await MovieService.getMovieGenres();
			if (genresData) {
				this.setState({ genresData, error: null });
			}
		} catch (error) {
			console.error('Error fetching movie genres:', error);
			this.setState({
				genresData: null,
				error: 'Failed to fetch movie genres',
			});
		}
	};

	debouncedFetchData = debounce((value) => {
		this.fetchMovieData(value);
		this.setState({ currentPage: 1 });
	}, 400);

	handlePageChange = (page) => {
		this.setState({ currentPage: page, loading: true }, () => {
			const { value, currentPage } = this.state;
			this.fetchMovieData(value, currentPage);
		});
	};

	// Рейтинг и табы
	handleTabChange = (tab) => {
		this.setState((prevState) => ({
			activeTab: tab === prevState.activeTab ? 'search' : tab,
		}));
	};

	handleRatedPageChange = (page) => {
		this.setState({ ratedMoviesCurrentPage: page, loading: true }, () => {
			this.getRatedMovies(page);
		});
	};

	requestGuestSessionId = async () => {
		const storedGuestSessionId = this.state.guestSessionId;

		if (storedGuestSessionId) {
			return storedGuestSessionId;
		}

		const localStorageGuestSessionId = localStorage.getItem('guestSessionId');

		if (localStorageGuestSessionId) {
			this.setState({ guestSessionId: localStorageGuestSessionId });
			return localStorageGuestSessionId;
		}

		try {
			const apiKey = this._token;

			const options = {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${apiKey}`,
				},
			};

			const response = await fetch(
				'https://api.themoviedb.org/3/authentication/guest_session/new',
				options,
			);

			const data = await response.json();

			if (response.ok && data.success) {
				const guestSessionId = data.guest_session_id;
				this.setState({ guestSessionId });
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
	};

	onAddRating = async (movieId, ratingValue) => {
		const { guestSessionId } = this.state;
		console.log(guestSessionId);
		if (!guestSessionId) {
			console.error('Guest session ID is not available');
			return;
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
				`https://api.themoviedb.org/3/movie/${movieId}/rating?api_key=ae263a4d47bf1bb773a53efcfbc70dcc&guest_session_id=${guestSessionId}`,
				options,
			);

			const data = await response.json();

			if (response.ok && data.success) {
				console.log('Оценено:', this.state.ratedMoviesData);
			} else {
				console.error('Error adding rating:', data.status_message);
			}
		} catch (error) {
			console.error('Error adding rating:', error);
		}
	};

	getRatedMovies = async (page = 1) => {
		try {
			this.setState({ loading: true });
			const localStorageGuestSessionId = localStorage.getItem('guestSessionId');

			if (!localStorageGuestSessionId) {
				console.error('Guest session ID not found in local storage');
				return;
			}
			const options = {
				method: 'GET',
				headers: {
					accept: 'application/json',
				},
			};

			const res = await fetch(
				`https://api.themoviedb.org/3/guest_session/${localStorageGuestSessionId}/rated/movies?api_key=ae263a4d47bf1bb773a53efcfbc70dcc&language=ru-RU&page=${page}`,
				options,
			);

			if (res.ok) {
				const data = await res.json();
				console.log('Rated movies data after fetching:', data);
				this.setState({ ratedMoviesData: data });
			} else {
				console.error('Error fetching rated movies:', res.statusText);
			}
		} catch (error) {
			console.error('Error fetching rated movies:', error);
		} finally {
			this.setState({ loading: false });
		}
	};
	render() {
		const {
			loading,
			movieData,
			genresData,
			currentPage,
			searchComlited,
			value,
			ratedMoviesData,
			activeTab,
		} = this.state;
		const totalPages =
			activeTab === 'search'
				? movieData
					? movieData.total_pages * 20
					: 0
				: ratedMoviesData
				  ? ratedMoviesData.total_pages * 20
				  : 0;
		const onPageChange =
			activeTab === 'search'
				? this.handlePageChange
				: this.handleRatedPageChange;
		if (!movieData && value !== '' && !loading && searchComlited) {
			return (
				<Alert
					className="error"
					message="Ошибка получения данных с API. Проверьте настройки VPN или прокси-сервера и перезагрузите страницу"
					type="error"
				></Alert>
			);
		}
		return (
			<div>
				<Offline>
					<div>
						<Alert
							message="Отсутствует подключение к интернету"
							type="error"
						></Alert>
					</div>
				</Offline>
				<Online>
					<div className="container">
						<Header onTabChange={this.handleTabChange} activeTab={activeTab} />

						{activeTab === 'search' && (
							<>
								<SearcItem
									fetchMovieData={this.fetchMovieData}
									onInputChange={this.onInputChange}
									value={value}
								/>
								{/* {!loading && searchComlited && movieData ? (
									<Alert message={`Результаты по запросу: ${value}`}></Alert>
								) : null} */}
								<MovieList
									loading={loading}
									ratedMovies={ratedMoviesData}
									movieData={movieData}
									genresData={genresData}
									searchComlited={searchComlited}
									value={value}
									onAddRating={this.onAddRating}
								/>
							</>
						)}
						{activeTab === 'rated' && (
							<RatedMovieList
								loading={loading}
								ratedMovies={ratedMoviesData}
								onAddRating={this.onAddRating}
								genresData={genresData}
								currentPage={currentPage}
								onPageChange={this.handleRatedPageChange}
							/>
						)}
						<Pagination
							current={
								activeTab === 'search'
									? currentPage
									: this.state.ratedMoviesCurrentPage
							}
							total={totalPages}
							pageSize={20}
							onChange={onPageChange}
							// showQuickJumper={true}
							showLessItems={false}
							showSizeChanger={false}
						/>
					</div>
				</Online>
			</div>
		);
	}
}
