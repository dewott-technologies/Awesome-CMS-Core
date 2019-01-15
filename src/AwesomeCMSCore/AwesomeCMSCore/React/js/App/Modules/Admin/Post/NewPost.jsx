import React, {Component} from "react";
import {render} from "react-dom";
import {
		Container,
		Row,
		Col,
		Button,
		Card,
		CardTitle
} from "reactstrap";
import toastr from "toastr";
import PropTypes from "prop-types";

import {Get, PostWithSpinner} from "Helper/Http";
import {STATUS_CODE, POST_STATUS} from "Helper/AppEnum";
import {SAVE_POST_API} from "Helper/API_Endpoint/PostEndpoint";
import {isDomExist} from "Helper/Util";
import {onChange, onBlur} from "Helper/StateHelper";
import {POST_OPTIONS_API} from "Helper/API_Endpoint/PostOptionEndpoint";

import ACCEditor from "Common/ACCInput/ACCEditor.jsx";
import ACCButton from "Common/ACCButton/ACCButton.jsx";
import ACCInput from "Common/ACCInput/ACCInput.jsx";
import ACCReactSelect from "Common/ACCSelect/ACCReactSelect.jsx";
import Spinner from "Common/ACCAnimation/Spinner.jsx";

class NewPost extends Component {
		constructor(props) {
				super(props);
				this.state = {
						postContent: "",
						title: "",
						shortDescription: "",
						tagValue: [],
						tagOptions: [],
						categoriesOptions: [],
						categoriesValue: [],
						loading: false,
						media: null
				};
		}

		componentDidMount() {
				Get(`${POST_OPTIONS_API}/Options`).then(res => {
						this.setState({
								tagOptions: res.data.tagViewModel.value
										? JSON.parse(res.data.tagViewModel.value)
										: [],
								categoriesOptions: res.data.categoriesViewModel.value
										? JSON.parse(res.data.categoriesViewModel.value)
										: []
						});
				});
		}

		newPost = (e, postStatus) => {
				e.preventDefault();

				const postOptionsDefaultViewModel = {
						tagViewModel: {
								key: JSON.stringify(this.state.tagValue.map(x => x.value)),
								value: JSON.stringify(this.state.tagValue)
						},
						categoriesViewModel: {
								key: JSON.stringify(this.state.categoriesValue.map(x => x.value)),
								value: JSON.stringify(this.state.categoriesValue)
						}
				};

				const viewModel = {
						Title: this.state.title,
						ShortDescription: this.state.shortDescription,
						Content: this.state.postContent,
						PostOptionsDefaultViewModel: postOptionsDefaultViewModel,
						PostStatus: postStatus,
						Thumbnail: this.state.media
				};

				PostWithSpinner
						.call(this, SAVE_POST_API, viewModel)
						.then(res => {
								if (res.status === STATUS_CODE.Success) 
										return toastr.success("Create new post success");
								}
						);
		};

		handleEditorChange = e => {
				this.setState({
						postContent: e
								.target
								.getContent()
				});
		};

		handleOnTagChange = tagValue => {
				this.setState({tagValue});
		};

		handleOnCatChange = categoriesValue => {
				this.setState({categoriesValue});
		};

		handleImagePreview = media => {
				this.clearImageState();
				// eslint-disable-next-line no-undef
				let reader = new FileReader();

				reader.onload = function (e) {
						// eslint-disable-next-line no-undef
						$('#thumbnail-preview').attr('src', e.target.result);
				}

				const mediaData = {
						name: media.name,
						fileName: media.name,
						length: media.size,
						contentType: media.type
				};

				this.setState({media: mediaData});
				reader.readAsDataURL(media);
		}

		removeImage = () => {
				this.clearImageState();
		}

		clearImageState = () => {
				this.setState({media: null});
		}
		render() {
				const {
						shortDescription,
						title,
						disabled,
						loading,
						tagValue,
						tagOptions,
						categoriesOptions,
						categoriesValue,
						media
				} = this.state;

				return (
						<Container>
								<div id="postContainer">
										<form>
												<Row>
														<Col md="9">
																<Row>
																		<Col md="12">
																				<ACCInput
																						type="text"
																						name="title"
																						id="title"
																						placeholder="Title"
																						required="required"
																						value={title}
																						onChange={title => onChange.call(this, title)}
																						onBlur={title => onBlur.call(this, title)}/>
																		</Col>
																</Row>
																<Row>
																		<Col md="12">
																				<ACCInput
																						type="text"
																						name="shortDescription"
																						id="shortDescription"
																						placeholder="Short Description"
																						required="required"
																						value={shortDescription}
																						onChange={shortDescription => onChange.call(this, shortDescription)}
																						onBlur={shortDescription => onBlur.call(this, shortDescription)}/>
																		</Col>
																</Row>
																<Row>
																		<Col md="12">
																				<div className="input-group mb-3">
																						<div className="input-group-prepend">
																								<span className="input-group-text" id="inputGroupFileAddon01">Upload</span>
																						</div>
																						<div className="custom-file">
																								<input
																										type="file"
																										className="custom-file-input"
																										name="media"
																										onChange={media => this.handleImagePreview(media.target.files[0])}/>
																								<label className="custom-file-label">Choose file</label>
																						</div>
																				</div>
																		</Col>
																</Row>
																<Row>
																		<Col
																				md="12"
																				className={media
																				? "visiblity"
																				: "hidden"}>
																				<div className="card">
																						<div className="card-header">
																								Preview
																						</div>
																						<div className="card-body">
																								<i
																										className="fa fa-minus-square fa-2x"
																										id="remove-icon"
																										onClick={this.removeImage}></i>
																								<img id="thumbnail-preview" src=""/>
																								<div className="card-body">
																										<p className="card-text">Please note that image will be resize when upload</p>
																								</div>
																						</div>
																				</div>
																		</Col>
																</Row>
																<Row>
																		<Col md="12">
																				<ACCEditor onChange={this.handleEditorChange}/>
																		</Col>
																</Row>
																<Row className="postFooter"/>
														</Col>
														<Col md="3">
																<Card body>
																		<CardTitle>Post Options</CardTitle>
																		<ACCReactSelect
																				options={tagOptions}
																				value={tagValue}
																				placeholder="Tags"
																				handleOnChange={value => this.handleOnTagChange(value)}/>
																		<br/>
																		<ACCReactSelect
																				options={categoriesOptions}
																				value={categoriesValue}
																				placeholder="Categories"
																				handleOnChange={value => this.handleOnCatChange(value)}/>
																		<br/>
																		<Button onClick={() => window.history.go(-1)}>Back</Button>
																		<br/>{" "} {!loading
																				? (
																						<div>
																								<ACCButton
																										disabled={disabled}
																										label="Save as Drafted"
																										btnBlocked="btn-block"
																										onClick={e => this.newPost(e, POST_STATUS.Draft)}/>
																								<br/>
																								<ACCButton
																										disabled={disabled}
																										label="Published Post"
																										btnBlocked="btn-block"
																										onClick={e => this.newPost(e, POST_STATUS.Published)}/>
																						</div>
																				)
																				: (<Spinner/>)}
																</Card>
														</Col>
												</Row>
										</form>
								</div>
						</Container>
				);
		}
}

NewPost.propTypes = {
		visible: PropTypes.bool
};

if (isDomExist("newPostContent")) {
		render(
				<NewPost/>, document.getElementById("newPostContent"));
}
