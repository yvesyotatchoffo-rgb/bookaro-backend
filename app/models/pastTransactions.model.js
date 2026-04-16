var Mongoose = require("mongoose"),
  Schema = Mongoose.Schema;

module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      id_mutation: {
        type: String,
      },
      mutation_date: {
        type: String,
      },
      provision_number: {
        type: String,
      },
      nature_mutation: {
        type: String,
      },
      land_value: {
        type: String,
      },
      address_number: {
        type: String,
      },
      address_suffix: {
        type: String,
      },
      address_channel_name: {
        type: String,
      },
      channel_code_address: {
        type: String,
      },
      postal_code: {
        type: String,
      },
      community_code: {
        type: String,
      },
      community_name: {
        type: String,
      },
      department_code: {
        type: String,
      },
      old_community_code: {
        type: String,
      },
      old_community_name: {
        type: String,
      },
      plot_id: {
        type: String,
      },
      old_plot_id: {
        type: String,
      },
      volume_number: {
        type: String,
      },
      lot1_number: {
        type: String,
      },
      lot1_surface_carrez: {
        type: String,
      },
      lot2_number: {
        type: String,
      },
      lot2_surface_carrez: {
        type: String,
      },
      lot3_number: {
        type: String,
      },
      lot3_surface_carrez: {
        type: String,
      },
      lot4_number: {
        type: String,
      },
      lot4_surface_carrez: {
        type: String,
      },
      lot5_number: {
        type: String,
      },
      lot5_surface_carrez: {
        type: String,
      },
      number_lots: {
        type: String,
      },
      local_type_code: {
        type: String,
      },
      local_type: {
        type: String,
      },
      real_built_surface: {
        type: String,
      },
      number_of_main_pieces: {
        type: String,
      },
      code_nature_culture: {
        type: String,
      },
      nature_culture: {
        type: String,
      },
      code_nature_culture_special: {
        type: String,
      },
      nature_culture_special: {
        type: String,
      },
      land_surface: {
        type: String,
      },
      longitude: {
        type: String,
      },
      latitude: {
        type: String,
      },
      year: {
        type: Number,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
      location: {
        type: Object
      }
    },
    { timestamps: true }
  );
  schema.index({ location: "2dsphere" });
  const transactions = mongoose.model("transactions", schema);

  return transactions;
};

//   {
//     mutation_id: {
//       type: String,
//     },
//     mutation_date: {
//       type: String,
//     },
//     provision_number: {
//       type: String,
//     },
//     nature_mutation: {
//       type: String,
//     },
//     land_value: {
//       type: String,
//     },
//     address_number: {
//       type: String,
//     },
//     address_suffix: {
//       type: String,
//     },
//     address_channel_name: {
//       type: String,
//     },
//     channel_code_address: {
//       type: String,
//     },
//     postal_code: {
//       type: String,
//     },
//     community_code: {
//       type: String,
//     },
//     community_name: {
//       type: String,
//     },
//     department_code: {
//       type: String,
//     },
//     old_community_code: {
//       type: String,
//     },
//     old_community_name: {
//       type: String,
//     },
//     plot_id: {
//       type: String,
//     },
//     old_plot_id: {
//       type: String,
//     },
//     volume_number: {
//       type: String,
//     },
//     lot1_number: {
//       type: String,
//     },
//     lot1_surface_carrez: {
//       type: String,
//     },
//     lot2_number: {
//       type: String,
//     },
//     lot2_surface_carrez: {
//       type: String,
//     },
//     lot3_number: {
//       type: String,
//     },
//     lot3_surface_carrez: {
//       type: String,
//     },
//     lot4_number: {
//       type: String,
//     },
//     lot4_surface_carrez: {
//       type: String,
//     },
//     lot5_number: {
//       type: String,
//     },
//     lot5_surface_carrez: {
//       type: String,
//     },
//     number_lots: {
//       type: String,
//     },
//     local_type_code: {
//       type: String,
//     },
//     local_type: {
//       type: String,
//     },
//     real_built_surface: {
//       type: String,
//     },
//     // number_of_main_pieces: {
//     //   type: String,
//     // },
//     noOfRooms: {
//       type: String,
//     },
//     code_nature_culture: {
//       type: String,
//     },
//     nature_culture: {
//       type: String,
//     },
//     code_nature_culture_special: {
//       type: String,
//     },
//     nature_culture_special: {
//       type: String,
//     },
//     land_surface: {
//       type: String,
//     },
//     longitude: {
//       type: String,
//     },
//     latitude: {
//       type: String,
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//     updatedAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   { timestamps: true }
// );