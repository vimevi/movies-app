import { Component } from 'react';

import './movie-item.scss';

import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { ru } from 'date-fns/esm/locale';
import { Rate } from 'antd';

import noPosterImg from '../../assets/images/no_poster.png';

export default class MovieItem extends Component {
	state = {
		mark: 0,
	};
	textCut(text = 'Нет информации') {
		const defaultText = 'В базе нет описания фильма';
		const wordLimit = 25;

		if (!text) return `${defaultText}...`;

		const truncatedWords = text.split(' ').slice(0, wordLimit);
		truncatedWords[truncatedWords.length - 1] = truncatedWords[
			truncatedWords.length - 1
		].replace(/[.,;:]+$/, '');

		return `${truncatedWords.join(' ')}...`;
	}
	handleRating = (value) => {
		const { movie, onAddRating } = this.props;
		onAddRating(movie.id, value);
		this.setState({ mark: value });
	};

	render() {
		// let styleArray = ['vote_average'];

		const { movie, genresData, rating } = this.props;
		let voteColor = '';
		voteColor +=
			movie.vote_average <= 3 && movie.vote_average !== 0
				? 'vote_average terrible'
				: movie.vote_average > 3 && movie.vote_average <= 5
				  ? 'vote_average bad'
				  : movie.vote_average > 5 && movie.vote_average <= 7
				    ? 'vote_average medium'
				    : movie.vote_average > 7
				      ? 'vote_average good'
				      : 'vote_average'; // учитывая, что 0 - отсутсвие оценок, цвет применяется серый
		return (
			<li key={movie.id}>
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
							: 'Даты выхода не найдено'}
					</p>
					<p className="genres">
						{movie.genre_ids.length >= 1 && genresData ? (
							<>
								<span>{genresData[+movie.genre_ids[0]]}</span>
								{movie.genre_ids.length >= 2 && (
									<span> {genresData[+movie.genre_ids[1]]}</span>
								)}{' '}
							</>
						) : (
							<span>Жанров не найдено</span>
						)}
					</p>
					<span className={voteColor}>
						{Number.isInteger(movie.vote_average)
							? movie.vote_average
							: movie.vote_average.toFixed(1)}
					</span>
					<p className="movie-overview">{this.textCut(movie.overview)}</p>
					<Rate
						className="rating-item"
						count={10}
						allowHalf={true}
						defaultValue={rating ? rating : this.state.mark}
						allowClear={false}
						onChange={(value) => this.handleRating(value)}
						style={{ color: '#F4A900' }}
					/>
				</div>
			</li>
		);
	}
}

MovieItem.defaultValue = {
	genresData: {},
	rating: 0,
	onAddRating: () => {},
};

MovieItem.propTypes = {
	movie: PropTypes.object.isRequired,
	genresData: PropTypes.object,
	onAddRating: PropTypes.func,
	rating: PropTypes.number,
};
