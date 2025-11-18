import { Schema, model } from 'mongoose';
import { BookStatus, IBook, PageType } from '../Types/book.types';

/**
 * Page Sub-Schema - Represents a single page in the cookbook
 */
// const PageSchema = new Schema({
//   // Cover page data
//   coverData: {
//     pageId: {
//       type: String,
//       required: true,
//     },
//     pageType: {
//       type: String,
//       enum: Object.values(PageType),
//       required: true,
//     },
//     position: {
//       type: Number,
//       required: true,
//     },
//     title: String,
//     subtitle: String,
//     backgroundImage: String,
//     backgroundColor: String,
//     customText: String,
//     layout: String,
//   },

//   // Introduction page data
//   introData: {
//     pageId: {
//       type: String,
//       required: true,
//     },
//     pageType: {
//       type: String,
//       enum: Object.values(PageType),
//       required: true,
//     },
//     position: {
//       type: Number,
//       required: true,
//     },
//     backgroundImage: String,
//     customContent: String,
//     layout: String,
//   },

//   // Recipe page data
//   recipe: [
//     {
//       pageId: {
//         type: String,
//         required: true,
//       },
//       pageType: {
//         type: String,
//         enum: Object.values(PageType),
//         required: true,
//       },
//       position: {
//         type: Number,
//         required: true,
//       },
//       basicInfo: {
//         recipeName: { type: String, trim: true, index: 'text' },
//         duration: {
//           value: String,
//           label: String,
//         },
//         level: {
//           value: String,
//           label: String,
//         },
//         serving: {
//           value: String,
//           label: String,
//         },
//         tags: [
//           {
//             value: String,
//             label: String,
//           },
//         ],
//         categories: [
//           {
//             value: String,
//             label: String,
//           },
//         ],
//       },
//       details: {
//         thumbnail: String,
//         about: [
//           {
//             type: {
//               type: String,
//               enum: ['text', 'image', 'video', 'title'],
//             },
//             value: Schema.Types.Mixed,
//             isUnsplash: Boolean,
//             isMultiple: Boolean,
//           },
//         ],
//         faqs: [
//           {
//             ques: String,
//             ans: String,
//           },
//         ],
//       },
//       directions: {
//         methods: [
//           {
//             step: [
//               {
//                 type: {
//                   type: String,
//                   enum: ['title', 'text', 'image', 'video'],
//                 },
//                 value: Schema.Types.Mixed,
//                 isUnsplash: Boolean,
//                 isMultiple: Boolean,
//               },
//             ],
//           },
//         ],
//         ingredients: [
//           {
//             name: String,
//             type: { type: String, enum: ['main', 'dressing'] },
//           },
//         ],
//       },
//       author: {
//         userId: {
//           type: String,
//           required: true,
//         },
//         firstName: String,
//         lastName: String,
//         avatar: String,
//         slogan: String,
//       },
//       order: {
//         type: Number,
//         required: true,
//         default: 1,
//       },
//       layout: {
//         type: String,
//         required: true,
//         default: 'layout-one',
//       },
//     },
//   ],

//   // Extra page data (blank pages, templates)
//   extraPageData: {
//      pageId: {
//       type: String,
//       required: true,
//     },
//     position: {
//       type: Number,
//       required: true,
//     },
//     title: String,
//     pageType: {
//       type: String,
//       enum: ['blank', 'template'],
//     },
//     templateType: String, // 'weekly-planner', 'note-page'
//     content: String, // HTML content if edited
//     layout: String,
//   },


//   // Edited content for this page
//   editedContent: String,
//   lastEditedAt: Date,
// });

/**
 * Book Schema - Stores edited cookbook content
 */
const BookSchema = new Schema<IBook>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    cookbook: {
      type: Schema.Types.ObjectId,
      ref: 'Cookbook',
      required: true,
      index: true,
    },

    // Cover page data
    coverData: {
      pageId: String,
      pageType: {
        type: String,
        enum: Object.values(PageType),
      },
      position: Number,
      title: String,
      subtitle: String,
      backgroundImage: String,
      backgroundColor: String,
      customText: String,
      layout: String,
    },

    // Introduction page data
    introData: {
      pageId: String,
      pageType: {
        type: String,
        enum: Object.values(PageType),
      },
      position: Number,
      backgroundImage: String,
      customContent: String,
      layout: String,
    },

    // Recipe pages array
    recipe: [
      {
        pageId: {
          type: String,
          required: true,
        },
        pageType: {
          type: String,
          enum: Object.values(PageType),
          required: true,
        },
        position: {
          type: Number,
          required: true,
        },
        basicInfo: {
          recipeName: { type: String, trim: true, index: 'text' },
          duration: {
            value: String,
            label: String,
          },
          level: {
            value: String,
            label: String,
          },
          serving: {
            value: String,
            label: String,
          },
          tags: [
            {
              value: String,
              label: String,
            },
          ],
          categories: [
            {
              value: String,
              label: String,
            },
          ],
        },
        details: {
          thumbnail: String,
          about: [
            {
              type: {
                type: String,
                enum: ['text', 'image', 'video', 'title'],
              },
              value: Schema.Types.Mixed,
              isUnsplash: Boolean,
              isMultiple: Boolean,
            },
          ],
          faqs: [
            {
              ques: String,
              ans: String,
            },
          ],
        },
        directions: {
          methods: [
            {
              step: [
                {
                  type: {
                    type: String,
                    enum: ['title', 'text', 'image', 'video'],
                  },
                  value: Schema.Types.Mixed,
                  isUnsplash: Boolean,
                  isMultiple: Boolean,
                },
              ],
            },
          ],
          ingredients: [
            {
              name: String,
              type: { type: String, enum: ['main', 'dressing'] },
            },
          ],
        },
        author: {
          userId: {
            type: String,
            required: true,
          },
          firstName: String,
          lastName: String,
          avatar: String,
          slogan: String,
        },
        order: {
          type: Number,
          required: true,
          default: 1,
        },
        layout: {
          type: String,
          required: true,
          default: 'layout-one',
        },
      },
    ],

    // Extra page data (blank pages, templates)
    extraPageData: {
      pageId: String,
      position: Number,
      title: String,
      pageType: {
        type: String,
        enum: ['blank', 'template'],
      },
      templateType: String,
      content: String,
      layout: String,
    },

    // Array of edited sections (for backward compatibility)
    sections: [
      {
        sectionId: {
          type: String,
          required: true,
        },
        sectionType: {
          type: String,
          enum: ['frontCover', 'backCover', 'intro', 'toc', 'notes', 'recipe'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        lastEditedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Status
    status: {
      type: String,
      enum: Object.values(BookStatus),
      default: BookStatus.DRAFT,
      index: true,
    },

    // Metadata
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
BookSchema.index({ cookbook: 1, isActive: 1 });
BookSchema.index({ cookbook: 1, 'recipe.pageId': 1 });
BookSchema.index({
  'recipe.author.userId': 1,
  isActive: 1,
  createdAt: -1,
});
BookSchema.index({ status: 1, isPublic: 1 });
BookSchema.index({ 'recipe.position': 1 }); // For sorting recipe pages

// Virtuals
BookSchema.virtual('recipeCount').get(function () {
  return this.recipe?.length || 0;
});

BookSchema.virtual('sectionCount').get(function () {
  return this.sections?.length || 0;
});

const Book = model<IBook>('Book', BookSchema);

export default Book;
