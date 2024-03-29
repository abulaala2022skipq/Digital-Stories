import React, { useState, useEffect } from "react";
import { Card, Col, Row, Form, Button } from "react-bootstrap";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import axios from "axios";
import { useSelector } from "react-redux";
import { ReactionContext } from "../contextApi/ReactionContext";
import AppLogo from "./1.PNG";
import { useContext } from "react";
const MultimediaStory = ({
  multimedia,
  postId,
  username_,
  description,
  date,
  type,
  user,
}) => {
  const { updateComments, updateUpvotes, updateDownvotes } =
    useContext(ReactionContext);
  const userState = useSelector((state) => state.userReducer);

  const [comment, setComment] = useState("");

  const [comments, setComments] = useState([]);

  const [upvotes, setUpvotes] = useState(0);

  const [downvotes, setDownvotes] = useState(0);

  const [addedvote, setaddedvote] = useState(false);

  // Effect to fetch comments

  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [picUrl, setPicUrl] = useState("");
  useEffect(() => {
    if (multimedia) {
      if (multimedia.contentType.startsWith("image/")) {
        const blob = new Blob([new Uint8Array(multimedia.data.data)], {
          type: multimedia.contentType,
        });
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrl(reader.result);
        };
        reader.readAsDataURL(blob);
      } else {
        const blob = new Blob([new Uint8Array(multimedia.data.data)], {
          type: multimedia.contentType,
        });
        const reader = new FileReader();
        reader.onloadend = () => {
          setVideoUrl(reader.result);
        };
        reader.readAsDataURL(blob);
        // console.log("videoUrl", videoUrl, multimedia.data);
      }
    }
  }, [multimedia]);

  useEffect(() => {
    if (user && user.image && user.image.data) {
      // console.log("user.image.data", user.image.data);
      const blob = new Blob([new Uint8Array(user.image.data.data)], {
        type: user.image.contentType,
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicUrl(reader.result);
      };
      reader.readAsDataURL(blob);
    } else {
      setPicUrl(AppLogo);
    }
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/comments/fetchallcomments/story/${postId}`
        );
        setComments(response.data);
        updateComments(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchComments();
  }, [postId]);

  // Effect to fetch upvotes and downvotes
  useEffect(() => {
    const fetchUpvotes = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/vote/upvotes/${postId}`
        );
        setUpvotes(response.data.length);
        updateUpvotes(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchDownvotes = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/vote/downvotes/${postId}`
        );
        setDownvotes(response.data.length);
        updateDownvotes(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUpvotes();
    fetchDownvotes();
  }, [postId, addedvote]);
  let { username } = userState.user; // use this username to save with the comment
  let { Authentication } = userState.user;

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:5000/comments/addcomment/story/${postId}`,
        {
          body: comment,
          username: username,
        },
        {
          headers: {
            Authentication: Authentication,
          },
        }
      );
      setComments([...comments, response.data]);
      setComment("");
    } catch (error) {
      console.error(error);
    }
  };
  const handleVote = async (event) => {
    if (event === "up") {
      await axios.post(`http://localhost:5000/vote/upvote/${postId}`, null, {
        headers: {
          Authentication: Authentication,
        },
      });
    } else {
      await axios.post(`http://localhost:5000/vote/downvote/${postId}`, null, {
        headers: {
          Authentication: Authentication,
        },
      });
    }
    setaddedvote(!addedvote);
  };
  return (
    <Row className="mt-5">
      <Col md={8}>
        <Card
          style={{
            width: "100%",
            backgroundColor: "#2F4858",
            color: "#ffffff",
            marginBottom: "35px",
          }}
        >
          {type === "image" ? (
            <img
              style={{
                width: "100%",
                height: "auto",
                minHeight: "400px",
                padding: "10px",
                border: "none",
                resize: "none",
              }}
              src={imageUrl}
              alt=""
            />
          ) : (
            <video
              style={{
                width: "100%",
                height: "auto",
                minHeight: "400px",
                padding: "10px",
                border: "none",
                resize: "none",
              }}
              src={videoUrl}
              controls
              autoPlay
              muted
            />
          )}
          <Card.Body style={{ maxHeight: "200px", overflow: "auto" }}>
            <Row className="align-items-center">
              <Col xs={2}>
                <img
                  src={picUrl}
                  alt="pic"
                  className="rounded-circle me-2"
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    marginRight: "10px",
                  }}
                />
              </Col>
              <Col xs={6}>
                <Card.Text style={{ color: "#B7C8FA" }}>
                  {description}
                </Card.Text>
                <Card.Title>{username_}</Card.Title>
              </Col>
              <Col xs={4} className="text-right">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Button variant="link" onClick={() => handleVote("up")}>
                    <FaArrowUp style={{ fontSize: "20px" }} />
                  </Button>
                  <span style={{ fontSize: "14px" }}>{upvotes}</span>
                  <Button variant="link" onClick={() => handleVote("down")}>
                    <FaArrowDown style={{ fontSize: "20px" }} />
                  </Button>
                  <span style={{ fontSize: "14px" }}>{downvotes}</span>
                </div>
              </Col>
            </Row>
            <small>{date.slice(0, 10)}</small>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card
          style={{
            width: "100%",
            backgroundColor: "#B7C8FA",
            color: "#ffffff",
            marginTop: "20px",
          }}
        >
          <Card.Body>
            <Card.Title>Comments</Card.Title>
            <Card.Text style={{ maxHeight: "350px", overflowY: "auto" }}>
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    backgroundColor: "#86BBD8",
                    padding: "5px",
                    borderRadius: "5px",
                    marginBottom: "5px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <span style={{ color: "#2F4858" }}>{comment.username}</span>
                  <hr style={{ color: "#ffffff" }}></hr>
                  <span style={{ color: "#2F4858" }}>{comment.body}</span>
                </div>
              ))}
            </Card.Text>

            <Form onSubmit={handleCommentSubmit}>
              <Form.Group controlId="comment" className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={1}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write a comment"
                />
              </Form.Group>
              <Button
                type="submit"
                style={{ backgroundColor: "#2F4858", borderColor: "#2F4858" }}
              >
                Submit
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default MultimediaStory;
