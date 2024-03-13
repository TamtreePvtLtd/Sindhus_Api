const mongoose = require("mongoose");
const { State, City } = require("country-state-city");

// Get array of US state names
const usStates = State.getStatesOfCountry("US").map(state => state.name);

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        const state = this.get('state');
        console.log("Selected state:", state);
        const cities = City.getCitiesOfState("US", state).map(city => city.name);
        console.log("Available cities:", cities);
        return cities.includes(v);
      },
      message: props => `${props.value} is not a valid city for the selected state.`,
    },
  },
  state: {
    type: String,
    required: true,
    enum: usStates,
  },
  zipcode: {
    type: String,
    required: true,
  }
});

// Pre-validate hook to ensure the city is valid for the selected state
userSchema.pre("validate", function(next) {
  const selectedState = this.state;
  console.log("Pre-validate hook - Selected state:", selectedState);
  const cities = City.getCitiesOfState("US", selectedState).map(city => city.getAllCities.name);
  console.log("Pre-validate hook - Available cities:", cities);
  this.city = cities.includes(this.city) ? this.city : undefined;
  next();
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
