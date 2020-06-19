const contractSource = `
    payable contract MemeVote = 
    
        record meme = 
            { creatorAddress : address,
            url : string,
            name : string,
            voteCount : int }
            
        record state = 
            { memes : map(int, meme),
            memesLength : int }
            
        entrypoint init() = 
            { memes = {},
            memesLength = 0 }
            
        entrypoint getMeme(index : int) : meme =
            switch(Map.lookup(index, state.memes))
            None => abort("There was no meme with this index registered.")
            Some(x) => x
            
        stateful entrypoint registerMeme(url' : string, name' : string) =
            let meme = { creatorAddress = Call.caller, url = url', name = name', voteCount = 0 }
            let index = getMemesLength() + 1
            put(state{ memes[index] = meme, memesLength = index })
            
        entrypoint getMemesLength() : int =
            state.memesLength
            
        payable stateful entrypoint voteMeme(index : int) = 
            let meme = getMeme(index)
            Chain.spend(meme.creatorAddress, Call.value)
            let updatedVoteCount = meme.voteCount + Call.value
            let updatedMemes = state.memes{ [index].voteCount = updatedVoteCount }
            put(state{ memes = updatedMemes })
    `;
const contractAdress = 'ct_swQbKQMWGdsk85EwhvUwvuMDzGqRB8wSRP3Xs9fjKfpirSiuz';
var client = null;
var memeArray = [];
var memesLength = 0;

function renderMemes() {
    memeArray = memeArray.sort(function(a,b){return b.votes-a.votes})
    var template = $('#template').html();
    Mustache.parse(template);
    var rendered = Mustache.render(template, {memeArray});
    $('#memeBody').html(rendered);
}

window.addEventListener('load', async () => {
    $('#loader').show();
    console.log('##### debuggin 3');
    Ae.Node({ url: 'https://sdk-testnet.aepps.com' }).then(node => {
            Ae.Universal({
                  nodes: [{ name: 'local', instance: node }]
                }).then(aeInstance => {
                  aeInstance.height().then(height => {
                    console.log("Current Block Height boucha 3:" + height)
                  })
                })
        })
    //console.log('##### before2:',Ae);
    /*Ae.Node({ url: 'https://sdk-testnet.aepps.com' }).then(node => {
        Ae.Universal({
              nodes: [{ name: 'local', instance: node }]
            }).then(aeInstance => {
              aeInstance.height().then(height => {
                console.log("Current Block Height:" + height)
              })*/
        
    //client = await Ae.Aepp();
    console.log('##### client2:');
    /*const contract = await client.getContractInstance(contractSource, {contractAdress});
    console.log('##### contract:',contract);
    const calledGet = await contract.call('getMemesLength',[],{callStatic:true}).catch(e => console.error(e));
    console.log('calledGet',calledGet);

    const decodedGet = await calledGet.decode().catch(e => console.log(e));
    console.log('decodedGet',decodedGet);*/

    renderMemes();

    $('#loader').hide();
});

jQuery("#memeBody").on("click", ".voteBtn", async function(event){
    const value = $(this).siblings('input').val();
    const dataIndex = event.target.id;
    const foundIndex = memeArray.findIndex( meme => meme.index == dataIndex);
    memeArray[foundIndex].votes += parseInt(value, 10);
    renderMemes();
})

$('#registerBtn').click(async function(){
    var name = ($('#regName').val()),
        url = ($('#regUrl').val());

    memeArray.push({
        creatorName : name,
        memeUrl : url,
        index : memeArray.length+1,
        votes : 0
    })
    renderMemes();
})