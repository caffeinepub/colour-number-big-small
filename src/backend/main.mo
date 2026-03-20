import Order "mo:core/Order";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";

actor {
  type PlayerScore = {
    name : Text;
    score : Nat;
  };

  module PlayerScore {
    public func compare(a : PlayerScore, b : PlayerScore) : Order.Order {
      Nat.compare(b.score, a.score);
    };
  };

  let playerMap = Map.empty<Text, Nat>();

  public shared ({ caller }) func submitScore(name : Text, score : Nat) : async () {
    if (score <= 0) {
      Runtime.trap("Score must be greater than 0");
    };
    playerMap.add(name, score);
  };

  public query ({ caller }) func getTopScores() : async [PlayerScore] {
    playerMap.toArray().map(
      func((name, score)) { { name; score } }
    ).sort().sliceToArray(0, 10);
  };

  public shared ({ caller }) func clearScores(adminCode : Text) : async () {
    if (adminCode != "supersecret") {
      Runtime.trap("Invalid admin code.");
    };
    playerMap.clear();
  };
};
