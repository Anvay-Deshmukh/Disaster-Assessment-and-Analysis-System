const express = require('express');
const multer = require('multer');
const { execFile } = require('child_process');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/assess', upload.fields([
    { name: 'preImage' },
    { name: 'postImage' }
]), (req, res) => {
    const preImage = req.files['preImage'][0].path;
    const postImage = req.files['postImage'][0].path;

    execFile('python', ['xview2_infer.py', preImage, postImage], (err, stdout, stderr) => {
        if (err) {
            console.error(stderr);
            return res.status(500).json({ error: 'Inference failed' });
        }
        res.json({ result: stdout });
    });
});

module.exports = router;
