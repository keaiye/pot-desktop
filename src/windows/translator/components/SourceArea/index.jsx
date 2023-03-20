import React, { useState, useEffect } from 'react'
import { Card, Box, InputBase, IconButton, Button as MuiButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { writeText } from '@tauri-apps/api/clipboard';
import { appWindow } from '@tauri-apps/api/window'
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event'
import PubSub from 'pubsub-js';
import './style.css'

export default function SourceArea() {
    const [sourceText, setSourceText] = useState('');

    useEffect(() => {
        if (appWindow.label == "translator") {
            // 获取选中文本
            invoke('get_selection_text').then(
                text => {
                    if (text != "") {
                        setSourceText(text.trim());
                        PubSub.publish('SourceText', text);
                    }
                }
            )
        }
        if (appWindow.label == "popclip") {
            listen('popclip', (event) => {
                setSourceText(event.payload);
            }).then(_ => { })
        }
    }, [])

    // 按键回调
    function keyDown(e) {
        if (e.keyCode === 13) {
            PubSub.publish('SourceText', sourceText);
        }
    }
    // 重新翻译
    function reTranslate() {
        PubSub.publish('SourceText', sourceText);
    }

    // 复制内容
    function copy(who) {
        writeText(who).then(
            _ => { console.log('success') }
        )
    }
    return (
        <Card className='sourcearea'>
            <Box className='overflow-sourcearea'>
                <InputBase
                    autoFocus
                    multiline
                    fullWidth
                    onKeyDown={(e) => { keyDown(e) }}
                    value={sourceText}
                    onChange={(e) => { setSourceText(e.target.value) }}
                />
            </Box>
            <Box className='source-buttonarea'>
                <IconButton className='source-button'
                    onClick={() => { copy(sourceText) }}
                >
                    <ContentCopyIcon />
                </IconButton>
                <MuiButton
                    variant="contained"
                    size='small'
                    onClick={reTranslate}
                >
                    翻译
                </MuiButton>
            </Box>
        </Card>
    )
}
