import React, { createContext, Component } from 'react';

import { Pagination, Alert } from 'antd';
import debounce from 'lodash.debounce';

import { Offline } from 'react-detect-offline';
import MovieList from '../movie-list/movie-list';
import SearcItem from '../search-item';
import MovieService from '../../Movie-service/movie-service';
import Header from '../header';
import RatedMovieList from '../rated-movie-list';

import './app.scss';

const GenresDataContext = createContext();

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
		this.getGuestSessionId();
		this.getRatedMovies();
	}
	setGenres = (genres) => {
		this.setState({ movieGenres: genres });
	};
	fetchMovieData = async (value, page = 1) => {
		this.setState({ loading: true });
		const movieData = await MovieService.fetchMovieData(value, page);

		this.setState({
			movieData: movieData,
			loading: false,
			searchComlited: true,
		});
	};

	getMovieGenres = async () => {
		const genresData = await MovieService.getMovieGenres();
		if (genresData) {
			this.setState({ genresData, error: null });
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

	getGuestSessionId = async () => {
		try {
			const storedGuestSessionId = localStorage.getItem('guestSessionId');
			if (storedGuestSessionId) {
				return storedGuestSessionId;
			}

			const fetchedGuestSessionId = await MovieService.requestGuestSessionId();
			if (fetchedGuestSessionId) {
				return fetchedGuestSessionId;
			}
		} catch (e) {
			<Alert
				message={`Ошибка получения ID гостевой сессии, ошибка: ${e}`}
			></Alert>;
		}
	};
	onAddRating = async (movieId, ratingValue) => {
		const guestSessionId = await this.getGuestSessionId();

		try {
			await MovieService.onAddRating(movieId, ratingValue, guestSessionId);
			console.log('Оценено:', this.state.ratedMoviesData);
			await this.getRatedMovies();
		} catch (e) {
			return (
				<Alert message={`Ошибка получения данных с API, ошибка: ${e}`}></Alert>
			);
		}
	};
	getRatedMovies = async (page) => {
		try {
			const data = await MovieService.getRatedMovies(page);
			this.setState({ ratedMoviesData: data });
			console.log('Rated movies data:', data);
		} catch (error) {
			return <Alert message="Ошибка получения данных с API"></Alert>;
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
		const GenresDataProvider = GenresDataContext.Provider;
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
				<div className="container">
					<GenresDataProvider value={genresData}>
						<Header onTabChange={this.handleTabChange} activeTab={activeTab} />

						{activeTab === 'search' && (
							<>
								<SearcItem
									fetchMovieData={this.fetchMovieData}
									onInputChange={this.onInputChange}
									value={value}
								/>
								<GenresDataContext.Consumer>
									{(contextValue) => (
										<MovieList
											loading={loading}
											ratedMovies={ratedMoviesData}
											movieData={movieData}
											genresData={contextValue}
											searchComlited={searchComlited}
											value={value}
											onAddRating={this.onAddRating}
										/>
									)}
								</GenresDataContext.Consumer>
							</>
						)}
						{activeTab === 'rated' && (
							<GenresDataContext.Consumer>
								{(contextValue) => (
									<RatedMovieList
										loading={loading}
										ratedMovies={ratedMoviesData}
										onAddRating={this.onAddRating}
										genresData={contextValue}
										currentPage={currentPage}
										onPageChange={this.handleRatedPageChange}
									/>
								)}
							</GenresDataContext.Consumer>
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
							showLessItems={false}
							showSizeChanger={false}
						/>
					</GenresDataProvider>
				</div>
			</div>
		);
	}
}
