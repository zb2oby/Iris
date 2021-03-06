
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { hashHistory, Link } from 'react-router'
import { bindActionCreators } from 'redux'
import FontAwesome from 'react-fontawesome'

import TrackList from '../components/TrackList'
import Track from '../components/Track'
import Dater from '../components/Dater'
import SidebarToggleButton from '../components/SidebarToggleButton'
import FullPlayer from '../components/FullPlayer'
import ArtistSentence from '../components/ArtistSentence'
import Thumbnail from '../components/Thumbnail'
import Header from '../components/Header'

import * as uiActions from '../services/ui/actions'
import * as pusherActions from '../services/pusher/actions'
import * as spotifyActions from '../services/spotify/actions'
import * as mopidyActions from '../services/mopidy/actions'

class Queue extends React.Component{

	constructor(props) {
		super(props)
	}

	removeTracks( tracks_indexes ){
		var tlids = [];
		for( var i = 0; i < tracks_indexes.length; i++ ){
			tlids.push( this.props.current_tracklist[tracks_indexes[i]].tlid )
		}
		this.props.mopidyActions.removeTracks( tlids )
	}

	playTrack( track ){
		this.props.mopidyActions.changeTrack( track.tlid )
	}

	playTracks( tracks ){
		this.props.mopidyActions.changeTrack( tracks[0].tlid )
	}

	reorderTracks( indexes, index ){
		this.props.mopidyActions.reorderTracklist( indexes, index )
	}

	renderQueueStats(){
		var total_time = 0

		return (
			<div className="queue-stats grey-text">
				<span>{this.props.current_tracklist.length} tracks</span>
				&nbsp;&nbsp;|&nbsp;&nbsp;
				{this.props.current_tracklist.length > 0 ? <Dater type="total-time" data={this.props.current_tracklist} /> : <span>0 mins</span>}
			</div>
		)
	}

	renderArtwork(){
		if( 
			!this.props.current_track || 
			!this.props.current_track.album || 
			!this.props.current_track.album.images ){
				return (
					<span className={this.props.radio_enabled ? 'artwork radio-enabled' : 'artwork'}>
						{this.props.radio_enabled ? <img className="radio-overlay" src="assets/radio-overlay.png" /> : null}
						<Thumbnail size="huge" />
					</span>
				)
		}

		var images = []
		if (this.props.current_track && this.props.current_track.album && this.props.current_track.album.images){
			images = this.props.current_track.album.images
		}

		var link = null
		if( this.props.current_track.album.uri ) link = '/album/'+this.props.current_track.album.uri
		return (
			<Link className={this.props.radio_enabled ? 'artwork radio-enabled' : 'artwork'} to={link} onContextMenu={e => this.handleContextMenu(e,this.props.current_track.album)}>
				{this.props.radio_enabled ? <img className="radio-overlay" src="assets/radio-overlay.png" /> : null}
				<Thumbnail size="huge" images={images} canZoom />
			</Link>
		)
	}

	render(){
		var options = (
			<span>
				<button className="no-hover" onClick={e => this.props.uiActions.openModal('edit_radio')}>
					<FontAwesome name="podcast" />&nbsp;
					Radio
					{this.props.radio && this.props.radio.enabled ? <span className="flag blue">On</span> : null}
				</button>
				<button className="no-hover" onClick={e => hashHistory.push(global.baseURL+'queue/history')}>
					<FontAwesome name="history" />&nbsp;
					History
				</button>
				<button className="no-hover" onClick={e => this.props.mopidyActions.clearTracklist()}>
					<FontAwesome name="trash" />&nbsp;
					Clear
				</button>
				<button className="no-hover" onClick={e => this.props.uiActions.openModal('add_to_queue', {})}>
					<FontAwesome name="plus" />&nbsp;
					Add URI
				</button>
			</span>
		)

		return (
			<div className="view queue-view">			
				<Header icon="play" title="Now playing" options={options} uiActions={this.props.uiActions} />

				<div className="content-wrapper">
				
					<div className="current-track">
						{ this.renderArtwork() }
						<div className="title">
							{this.props.current_track ? this.props.current_track.name : <span>-</span>}
						</div>
						{this.props.current_track ? <ArtistSentence artists={ this.props.current_track.artists } /> : <ArtistSentence />}
					</div>

					<section className="list-wrapper">
						<TrackList
							show_source_icon={true}
							context="queue"
							className="queue-track-list"
							tracks={this.props.current_tracklist}
							removeTracks={ tracks => this.removeTracks( tracks ) }
							playTracks={ tracks => this.playTracks( tracks ) }
							playTrack={ track => this.playTrack( track ) }
							reorderTracks={ (indexes, index) => this.reorderTracks(indexes, index) } />
					</section>
				
				</div>
			</div>
		);
	}
}


/**
 * Export our component
 *
 * We also integrate our global store, using connect()
 **/

const mapStateToProps = (state, ownProps) => {
	return {
		radio: state.ui.radio,
		radio_enabled: (state.ui.radio && state.ui.radio.enabled ? true : false),
		current_tracklist: state.ui.current_tracklist,
		current_track: (typeof(state.ui.current_track) !== 'undefined' && typeof(state.ui.tracks) !== 'undefined' && typeof(state.ui.tracks[state.ui.current_track.uri]) !== 'undefined' ? state.ui.tracks[state.ui.current_track.uri] : null),
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		uiActions: bindActionCreators(uiActions, dispatch),
		pusherActions: bindActionCreators(pusherActions, dispatch),
		spotifyActions: bindActionCreators(spotifyActions, dispatch),
		mopidyActions: bindActionCreators(mopidyActions, dispatch)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Queue)