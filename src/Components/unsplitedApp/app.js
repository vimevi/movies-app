import { Component } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/esm/locale';
import { Rate, Pagination, Alert } from 'antd';

import { Offline, Online } from 'react-detect-offline';
import Spinner from '../Spinner';

import './app.scss';

import noPosterImg from '../../assets/images/no_poster.png';

export default class App extends Component {
	state = {
		movieData: null,
		loading: true,
	};

	ids = 100;

	textCut(text = 'Нет информации') {
		const defaultText = 'В базе нет описания фильма';
		const wordLimit = 35;

		if (!text) return `${defaultText}...`;

		const truncatedWords = text.split(' ').slice(0, wordLimit);
		truncatedWords[truncatedWords.length - 1] = truncatedWords[
			truncatedWords.length - 1
		].replace(/[.,;:]+$/, '');

		return `${truncatedWords.join(' ')}...`;
	}

	componentDidMount() {
		this.fetchMovieData();
	}

	fetchMovieData = async () => {
		const options = {
			method: 'GET',
			headers: {
				Authorization:
					'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhZTI2M2E0ZDQ3YmYxYmI3NzNhNTNlZmNmYmM3MGRjYyIsInN1YiI6IjY1NWEwNjU5ZWE4NGM3MTA5NTlmOWE1NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.n7Qkzm63Q1_hH7F_eHmn_G8m30_-Vh0j8fAvtmtpX98',
				'Content-Type': 'application/json',
			},
		};
		const MOVIE_API_URL =
			'https://api.themoviedb.org/3/search/movie?query=ыы&language=ru&api_key=ae263a4d47bf1bb773a53efcfbc70dcc';
		try {
			const response = await fetch(MOVIE_API_URL, options);
			if (!response.ok) {
				console.error(`Could not fetch ${MOVIE_API_URL}`);
				this.setState({ loading: false });
				return;
			}

			const movieData = await response.json();

			console.log('movieData: ', movieData);
			this.setState({ movieData });
			this.setState({ loading: false });
		} catch (error) {
			console.error('Error:', error.message);
		}
	};
	renderMovieDetails() {
		const { movieData, loading } = this.state;

		if (loading) {
			return <Spinner />;
		}
		return movieData.results.map((movie) => {
			return (
				<li key={this.ids++}>
					<div className="poster-block">
						<img
							className="movie-poster"
							src={
								movie.poster_path
									? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
									: noPosterImg
							}
							alt="Poster"
						/>
					</div>
					<div className="info-block">
						<h3 className="movie-title">{movie.title || movie.name}</h3>
						<p className="movie-release">
							{movie.release_date
								? format(new Date(movie.release_date), 'dd MMMM, yyyy', {
										locale: ru,
								  })
								: 'Дата выхода неизевстна'}
						</p>
						{/* <p>{`${movie.genre_id[0].name}, ${movie.genre_id[1].name}`}</p> */}
						<p className="genres">
							<span>Боевик</span> <span>Криминал</span>{' '}
						</p>
						<span className="vote_average">
							{Number.isInteger(movie.vote_average)
								? movie.vote_average
								: movie.vote_average.toFixed(1)}
						</span>
						<p className="movie-overview">{this.textCut(movie.overview)}</p>
						<Rate
							className="ratingItem"
							count={10}
							allowHalf={true}
							defaultValue={+movie.vote_average.toFixed(1)}
						/>
					</div>
				</li>
			);
		});
	}

	render() {
		const { loading, movieData } = this.state;
		return (
			<div>
				<Online>
					<div className="container">
						<ul className="movies-list">
							{!loading && movieData.results.length === 0 ? (
								<span className="not-found">Поиск не дал результатов</span>
							) : null}
							<>{this.renderMovieDetails()}</>
						</ul>
						<Pagination
						// disabled
						/>
					</div>
				</Online>
				<Offline>
					<div>
						<Alert message="Отсутствует подключение к интернету" type="error">
							{' '}
						</Alert>
					</div>
				</Offline>
			</div>
		);
	}
}
