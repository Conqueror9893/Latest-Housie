import React from "react";
import "../styles/landingPage.css";
import { Link } from "react-router-dom";

import img1 from "../assets/images/logo_new.png";

const LandingPage = () => {
  return (
    <>
      <div className="container p-3">
        <div className="row">

        {/* Logo Container */}
          <div className="image__container">
            <img src={img1} className="logo" alt="Hosuie Housie" />
          </div>
          <h2 className="home__intro">Welcome to Housie Housie</h2>

        {/* New game or Join Game */}
          <div className="options">
            <div class="contents">
              <Link to="create-game" class="  split-section left">
                <div class="text-center">
                  <div class="hero-text">New Game</div>
                  <div class="hero-subtitle">
                    Host with friends using tickets.
                  </div>
                </div>
              </Link>
              <div class="divider">
                <div class="circle">OR</div>
              </div>
              <Link
                to="join-game"
                class=" split-section right"
                href="/participant/"
              >
                <div class="text-center">
                  <div class="hero-text">Join a Game</div>
                  <div class="hero-subtitle">
                    Participate using an invite code.
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Information Section */}
        <section className="info">
          <div class="grid-container">
            <div class="play-online">
              <h3 className="info-head underline-text">Play Online Tambola</h3>
              <p>
                Housie Hosuie, is a popular game of chance played with tickets
                containing numbers. To play online Tambola:
              </p>
              <ul>
                <li>Get your Tambola ticket ready.</li>
                <li>Wait for the host to call out numbers (for our case its automated).</li>
                <li>Mark the called numbers on your ticket.</li>
                <li>
                Get points by completing patterns on your ticket!
                </li>
              </ul>
            </div>
            <div class="rules">
              <h3 className="info-head underline-text">Rules</h3>
              <ol>
                <li>
                  Players get tickets containing numbers arranged in a
                  cell.
                </li>
                <li>
                  A designated caller randomly selects numbers and announces
                  them to the players.
                </li>
                <li>
                  Players mark off the numbers on their tickets as they are
                  called.
                </li>
                <li>
                  The first player to mark off a predetermined pattern of
                  numbers on their ticket and claims full house will be winner.
                </li>
                <li>
                  The game continues with different patterns until all prizes
                  are awarded.
                </li>
              </ol>
            </div>
            <div class="points">
              <h3 className="info-head underline-text">Points</h3>
              <ul>
                {/* <li>Marking off a number: +1 point</li> */}
                <li>Completing the first line: +5 points</li>
                <li>Completing the fastest five: +10 points</li>
                <li>Completing a full house (all numbers): +20 points</li>
              </ul>
            </div>
          </div>
        </section>


        {/* Instruction Section */}
        <section className="instruction">
          <h2 className="underline-text">How to play Housie Housie</h2>
          <p className="info-detailed">
            Housie Housie / Bingo / Tambola are all similar games. To play this
            game one has to be the host who will start the game and they will be
            responsible for inviting the participants as well. Tambola is played
            on a basic principle. The host calls the Number/ (handled
            automatically in our case) one at a time and players need to strike
            Numbers on their tickets. Tambola can be played in many different
            ways depending on the competency level of the target audience.
            Generally, Tambola is played with Numbers (1-90) and players
            striking out those Numbers on their Tickets.
          </p>
        </section>
      </div>

      {/* Footer Section */}
      <section className="footer">
        <p
          className="footer-text
          "
        >
          All rights reserved &copy; {new Date().getFullYear()}
        </p>
      </section>
    </>
  );
};
export default LandingPage;
