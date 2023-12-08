import { createContext, Component } from 'react';

import movieService from '../../Services/movie-service';
import { Pagination, Alert } from 'antd';
import debounce from 'lodash.debounce';

import { Offline } from 'react-detect-offline';
import MovieList from '../movie-list/movie-list';
import SearcItem from '../search-item';
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
		error: false,
		errorMessage: '',
	};

	onError = (error) => {
		this.setState({
			error: true,
			loading: false,
			errorMessage: `Что-то пошло не так. Ошибка: ${error}`,
		});
	};

	fetchMovieData = async (value, page = 1) => {
		this.setState({ loading: true });
		const movieData = await movieService
			.fetchMovieData(value, page)
			.catch((error) => this.onError(error.message));
		this.setState({
			movieData: movieData,
			loading: false,
			searchComlited: true,
		});
	};

	onInputChange = (e) => {
		const value = e.target.value;
		this.setState({ value });
		this.debouncedFetchData(value);
	};

	rateMovieAndFetchData = async () => {
		this.fetchMovieData(this.state.value, this.state.currentPage);
	};

	async componentDidMount() {
		await this.getMovieGenres();
		await this.getGuestSessionId();
		await this.getRatedMovies();
	}
	setGenres = (genres) => {
		this.setState({ movieGenres: genres });
	};

	getMovieGenres = async () => {
		const genresData = await movieService
			.getMovieGenres()
			.catch((e) => this.onError(e));
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
		this.setState({ loading: true }, () => {
			this.getRatedMovies().then(() => {
				this.setState((prevState) => ({
					activeTab: tab === prevState.activeTab ? 'search' : tab,
					loading: false,
				}));
			});
		});
	};

	handleRatedPageChange = async (page) => {
		this.setState({ ratedMoviesCurrentPage: page, loading: true }, async () => {
			try {
				const data = await movieService.getRatedMovies(page);
				this.setState({ ratedMoviesData: data, loading: false });
			} catch (error) {
				this.setState({ loading: false });
				return (
					<Alert message={`Страницы не найдено. Ошибка: ${error}`}></Alert>
				);
			}
		});
	};
	getGuestSessionId = async () => {
		const storedGuestSessionId = localStorage.getItem('guestSessionId');
		if (storedGuestSessionId) {
			return storedGuestSessionId;
		}

		const fetchedGuestSessionId = await movieService
			.requestGuestSessionId()
			.catch((e) => this.onError(e));
		if (fetchedGuestSessionId) {
			return fetchedGuestSessionId;
		}
	};
	onAddRating = async (movieId, ratingValue) => {
		const guestSessionId = await this.getGuestSessionId();

		await movieService.onAddRating(movieId, ratingValue, guestSessionId);
		await this.getRatedMovies().catch((e) => this.onError(e));
	};

	getRatedMovies = async (page) => {
		const data = await movieService
			.getRatedMovies(page)
			.catch((e) => this.onError(e));
		this.setState({ ratedMoviesData: data });
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
			error,
			errorMessage,
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

		if (error && !loading) {
			return <Alert type="error" message={errorMessage}></Alert>;
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
