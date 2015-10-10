// import { signUpload, getKey, getPrefix } from '../../aws/s3';
//
// export default function(src, type){
//   let extname = path.exte
//   return getPrefix(src)
//     .then(prefix => {
//
//     })
//   return Promise.all([
//     signUpload(`${prefix}/thumb)
//     ])
//   return [{
//     name: 'resize_to_fit',
//     params: {
//       width: 400
//     },
//     save: {
//       image_identifier: 'ORIG',
//       s3_destination: {
//         signed_url: signUpload,
//         headers: {
//           'x-amx-acl': 'public-read'
//         }
//       }
//     },
//     functions: [
//       {
//         name: 'imagga_smart_crop',
//         params: {
//           resolution: '150x150',
//           no_scaling: 0
//         },
//         save: {
//           image_identifier: 'MY_CLIENT_ID'
//         }
//       },
//       {
//         name: 'imagga_smart_crop',
//         params: {
//           resolution: '175x90',
//           no_scaling: 0
//         },
//         save: {
//           quality: 99,
//           image_identifier: 'MY_CLIENT_ID2'
//         }
//       }
//     ]
//   }];
// }
